const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/** Scans entire table with automatic pagination */
async function scanAll(tableName) {
  const items = [];
  let lastKey;
  do {
    const params = { TableName: tableName };
    if (lastKey) params.ExclusiveStartKey = lastKey;
    const result = await ddb.send(new ScanCommand(params));
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

/** Matches a DynamoDB item against a MongoDB-style query object */
function matchQuery(item, query) {
  for (const [key, value] of Object.entries(query)) {
    if (key === '$or') {
      if (!value.some(sub => matchQuery(item, sub))) return false;
      continue;
    }
    if (key === '$and') {
      if (!value.every(sub => matchQuery(item, sub))) return false;
      continue;
    }
    const iv = item[key];
    if (value === null || value === undefined) {
      if (iv != null) return false;
      continue;
    }
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if ('$regex' in value) {
        const re = new RegExp(value.$regex, value.$options || '');
        if (!re.test(String(iv ?? ''))) return false;
        continue;
      }
      if ('$eq' in value) { if (iv !== value.$eq) return false; continue; }
      if ('$gt' in value) { if (!(iv > value.$gt)) return false; continue; }
      if ('$gte' in value) { if (!(new Date(iv) >= new Date(value.$gte))) return false; continue; }
      if ('$lte' in value) { if (!(new Date(iv) <= new Date(value.$lte))) return false; continue; }
      if ('$in' in value) { if (!value.$in.includes(iv)) return false; continue; }
      continue;
    }
    // Array field: check inclusion
    if (Array.isArray(iv)) {
      if (!iv.includes(value)) return false;
      continue;
    }
    if (iv !== value) return false;
  }
  return true;
}

/** Sorts array by a sort object like { postedAt: -1 } */
function applySort(arr, sortObj) {
  if (!sortObj || !Object.keys(sortObj).length) return arr;
  const [key, dir] = Object.entries(sortObj)[0];
  return [...arr].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return dir === 1 ? -1 : 1;
    if (av > bv) return dir === 1 ? 1 : -1;
    return 0;
  });
}

module.exports = { ddb, scanAll, matchQuery, applySort };
