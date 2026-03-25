const { GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ddb, scanAll, matchQuery, applySort } = require('../db/dynamo');
const { randomUUID } = require('crypto');

const TABLE = process.env.DYNAMO_TABLE_MOVIES || 'vnmovies-movies';

function normalize(item) {
  if (!item) return null;
  return { ...item, _id: item.id };
}

class Movie {
  constructor(data) {
    Object.assign(this, data);
    if (!this.id) this.id = randomUUID();
    this._id = this.id;
    if (!this.postedAt) this.postedAt = new Date().toISOString();
    if (!this.createdAt) this.createdAt = new Date().toISOString();
    if (!this.updatedAt) this.updatedAt = new Date().toISOString();
    if (this.views == null) this.views = 0;
    if (this.downloads && typeof this.downloads.get === 'function') {
      this.downloads = Object.fromEntries(this.downloads.entries());
    }
    if (!this.downloads) this.downloads = {};
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    this._id = this.id;
    await ddb.send(new PutCommand({ TableName: TABLE, Item: { ...this } }));
    return this;
  }

  toObject() { return { ...this }; }
  toJSON()   { return { ...this }; }

  static async find(query = {}, opts = {}) {
    const { sort, skip = 0, limit } = opts;
    let items = await scanAll(TABLE);
    if (query && Object.keys(query).length) {
      items = items.filter(i => matchQuery(i, query));
    }
    if (sort) items = applySort(items, sort);
    if (skip) items = items.slice(skip);
    if (limit != null) items = items.slice(0, limit);
    return items.map(normalize);
  }

  static async findOne(query = {}) {
    const items = await scanAll(TABLE);
    const found = items.find(i => matchQuery(i, query));
    return found ? normalize(found) : null;
  }

  static async findById(id) {
    const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    return result.Item ? normalize(result.Item) : null;
  }

  static async findByIdAndUpdate(id, update, opts = {}) {
    const existing = await Movie.findById(id);
    if (!existing) return null;
    let updated = { ...existing };
    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        updated[key] = (Number(updated[key]) || 0) + val;
      }
    }
    if (update.$set) Object.assign(updated, update.$set);
    if (!Object.keys(update).some(k => k.startsWith('$'))) Object.assign(updated, update);
    updated._id = updated.id;
    updated.updatedAt = new Date().toISOString();
    await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
    return opts.new !== false ? normalize(updated) : normalize(existing);
  }

  static async findByIdAndDelete(id) {
    const existing = await Movie.findById(id);
    if (!existing) return null;
    await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
    return existing;
  }

  static async countDocuments(query = {}) {
    const items = await scanAll(TABLE);
    if (!query || !Object.keys(query).length) return items.length;
    return items.filter(i => matchQuery(i, query)).length;
  }

  static async create(data) {
    const movie = new Movie(data);
    await movie.save();
    return movie;
  }
}

module.exports = Movie;

