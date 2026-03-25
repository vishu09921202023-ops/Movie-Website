/**
 * Migrates data from local MongoDB → AWS DynamoDB
 * 
 * Run on your LOCAL PC (before deploying to AWS):
 *   node backend/db/migrate.js
 * 
 * Prerequisites:
 *   - MongoDB running locally (mongodb://localhost:27017/vegamovies)
 *   - AWS credentials configured (env vars or ~/.aws/credentials)
 *   - DynamoDB tables already created (run setup-tables.js on EC2 first)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vegamovies';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const dynamoClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLES = {
  movies: process.env.DYNAMO_TABLE_MOVIES || 'vnmovies-movies',
  admins: process.env.DYNAMO_TABLE_ADMINS || 'vnmovies-admins',
  analytics: process.env.DYNAMO_TABLE_ANALYTICS || 'vnmovies-analytics',
  sitelinks: process.env.DYNAMO_TABLE_SITELINKS || 'vnmovies-sitelinks',
};

async function migrateCollection(db, collectionName, tableName, transformFn) {
  const collection = db.collection(collectionName);
  const docs = await collection.find({}).toArray();
  console.log(`  ${collectionName}: ${docs.length} documents`);

  let ok = 0, fail = 0;
  for (const doc of docs) {
    try {
      const item = transformFn(doc);
      await ddb.send(new PutCommand({ TableName: tableName, Item: item }));
      ok++;
    } catch (err) {
      console.error(`  ✗ Failed doc ${doc._id}: ${err.message}`);
      fail++;
    }
  }
  console.log(`  ✓ Migrated ${ok}/${docs.length} (${fail} failed)`);
}

function serializeDoc(doc) {
  const item = {};
  for (const [k, v] of Object.entries(doc)) {
    if (k === '_id') {
      item.id = v.toString();
      item._id = v.toString();
    } else if (v instanceof Date) {
      item[k] = v.toISOString();
    } else if (v instanceof Map) {
      item[k] = Object.fromEntries(v.entries());
    } else if (v != null && typeof v === 'object' && v.constructor?.name === 'ObjectId') {
      item[k] = v.toString();
    } else {
      item[k] = v;
    }
  }
  return item;
}

async function main() {
  console.log('🔄 Connecting to MongoDB...');
  const conn = await mongoose.connect(MONGO_URI);
  const db = conn.connection.db;
  console.log('✓ Connected to MongoDB\n');

  console.log('📦 Migrating collections to DynamoDB...\n');

  // Movies
  console.log('1. Movies →', TABLES.movies);
  await migrateCollection(db, 'movies', TABLES.movies, (doc) => {
    const item = serializeDoc(doc);
    if (!item.id) item.id = doc._id.toString();
    return item;
  });

  // Admins
  console.log('\n2. Admins →', TABLES.admins);
  await migrateCollection(db, 'admins', TABLES.admins, (doc) => {
    const item = serializeDoc(doc);
    if (!item.id) item.id = doc._id.toString();
    return item;
  });

  // Analytics
  console.log('\n3. Analytics →', TABLES.analytics);
  await migrateCollection(db, 'analytics', TABLES.analytics, (doc) => {
    const item = serializeDoc(doc);
    // Analytics uses 'pk' as primary key
    if (item.event === 'view') {
      item.pk = `VIEW#${item.movieId}#${item.ipHash || 'unknown'}`;
    } else {
      item.pk = `DOWNLOAD#${item.id || doc._id.toString()}`;
    }
    return item;
  });

  // SiteLinks
  console.log('\n4. SiteLinks →', TABLES.sitelinks);
  await migrateCollection(db, 'sitelinks', TABLES.sitelinks, (doc) => {
    const item = serializeDoc(doc);
    if (!item.id) item.id = doc._id.toString();
    return item;
  });

  await mongoose.disconnect();
  console.log('\n✅ Migration complete!');
}

main().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
