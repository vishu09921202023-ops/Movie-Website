const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ddb, scanAll, matchQuery } = require('../db/dynamo');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

const TABLE = process.env.DYNAMO_TABLE_ADMINS || 'vnmovies-admins';

class Admin {
  constructor(data) {
    Object.assign(this, data);
    if (!this.id) this.id = randomUUID();
    this._id = this.id;
    if (!this.createdAt) this.createdAt = new Date().toISOString();
    if (!this.role) this.role = 'admin';
  }

  async save() {
    // Hash password if plain text provided
    if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    this._id = this.id;
    await ddb.send(new PutCommand({ TableName: TABLE, Item: { ...this } }));
    return this;
  }

  async comparePassword(plain) {
    return bcrypt.compare(plain, this.passwordHash);
  }

  static async findOne(query = {}) {
    const items = await scanAll(TABLE);
    const found = items.find(i => matchQuery(i, query));
    if (!found) return null;
    const admin = new Admin(found);
    return admin;
  }

  static async findById(id) {
    const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    return result.Item ? new Admin(result.Item) : null;
  }

  static async create(data) {
    const admin = new Admin(data);
    await admin.save();
    return admin;
  }
}

module.exports = Admin;
