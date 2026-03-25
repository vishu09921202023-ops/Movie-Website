const { GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ddb, scanAll, matchQuery, applySort } = require('../db/dynamo');
const { randomUUID } = require('crypto');

const TABLE = process.env.DYNAMO_TABLE_SITELINKS || 'vnmovies-sitelinks';

function normalize(item) {
  if (!item) return null;
  return { ...item, _id: item.id };
}

class SiteLink {
  constructor(data) {
    Object.assign(this, data);
    if (!this.id) this.id = randomUUID();
    this._id = this.id;
    if (!this.createdAt) this.createdAt = new Date().toISOString();
    if (!this.updatedAt) this.updatedAt = new Date().toISOString();
    if (this.isActive == null) this.isActive = true;
    if (this.row == null) this.row = 1;
    if (this.order == null) this.order = 0;
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    this._id = this.id;
    await ddb.send(new PutCommand({ TableName: TABLE, Item: { ...this } }));
    return this;
  }

  static async find(query = {}, opts = {}) {
    const { sort } = opts;
    let items = await scanAll(TABLE);
    if (query && Object.keys(query).length) {
      items = items.filter(i => matchQuery(i, query));
    }
    if (sort) items = applySort(items, sort);
    return items.map(normalize);
  }

  static async findById(id) {
    const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    return result.Item ? normalize(result.Item) : null;
  }

  static async findByIdAndUpdate(id, data, opts = {}) {
    const existing = await SiteLink.findById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, _id: id, updatedAt: new Date().toISOString() };
    await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
    return opts.new !== false ? normalize(updated) : normalize(existing);
  }

  static async findByIdAndDelete(id) {
    const existing = await SiteLink.findById(id);
    if (!existing) return null;
    await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
    return existing;
  }

  static async create(data) {
    const link = new SiteLink(data);
    await link.save();
    return link;
  }
}

module.exports = SiteLink;
