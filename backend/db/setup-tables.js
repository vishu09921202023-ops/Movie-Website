/**
 * Creates all DynamoDB tables for VN Movies HD.
 * Run ONCE on AWS EC2 after deployment:
 *   node backend/db/setup-tables.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

const TABLES = [
  {
    TableName: process.env.DYNAMO_TABLE_MOVIES || 'vnmovies-movies',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMO_TABLE_ADMINS || 'vnmovies-admins',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMO_TABLE_ANALYTICS || 'vnmovies-analytics',
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMO_TABLE_SITELINKS || 'vnmovies-sitelinks',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (e) {
    if (e.name === 'ResourceNotFoundException') return false;
    throw e;
  }
}

async function createTables() {
  for (const table of TABLES) {
    if (await tableExists(table.TableName)) {
      console.log(`✓ Already exists: ${table.TableName}`);
    } else {
      await client.send(new CreateTableCommand(table));
      console.log(`✓ Created: ${table.TableName}`);
    }
  }
  console.log('\n✅ All tables ready!');
}

createTables().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
