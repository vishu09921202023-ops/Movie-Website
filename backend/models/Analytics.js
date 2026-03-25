const { PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ddb, scanAll, matchQuery } = require('../db/dynamo');
const { randomUUID } = require('crypto');

const TABLE = process.env.DYNAMO_TABLE_ANALYTICS || 'vnmovies-analytics';

class Analytics {
  /**
   * Record a view event with deduplication (one unique view per IP per movie).
   * Returns { isNew: boolean }
   */
  static async recordUniqueView(movieId, ipHash, userAgent) {
    const pk = `VIEW#${movieId}#${ipHash}`;
    try {
      await ddb.send(new PutCommand({
        TableName: TABLE,
        Item: {
          pk,
          movieId,
          event: 'view',
          ipHash,
          userAgent: userAgent || '',
          timestamp: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(pk)',
      }));
      return { isNew: true };
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') return { isNew: false };
      throw err;
    }
  }

  /** Record a download event (always creates a new record) */
  static async create(data) {
    const pk = `DOWNLOAD#${randomUUID()}`;
    const item = {
      pk,
      movieId: String(data.movieId || ''),
      movieTitle: data.movieTitle || '',
      contentType: data.contentType || 'movie',
      event: data.event || 'download',
      quality: data.quality || '',
      ipHash: data.ipHash || '',
      userAgent: data.userAgent || '',
      timestamp: new Date().toISOString(),
    };
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  }

  static async countDocuments(query = {}) {
    const items = await scanAll(TABLE);
    if (!query || !Object.keys(query).length) return items.length;
    return items.filter(i => matchQuery(i, query)).length;
  }

  static async distinct(field, query = {}) {
    const items = await scanAll(TABLE);
    const filtered = query && Object.keys(query).length
      ? items.filter(i => matchQuery(i, query))
      : items;
    return [...new Set(filtered.map(i => i[field]).filter(v => v != null))];
  }

  /**
   * Aggregate daily counts grouped by date string.
   * query: { event, timestamp: { $gte: date } }
   * Returns [{ _id: 'YYYY-MM-DD', count: N }] sorted by date asc.
   */
  static async dailyCounts(query = {}) {
    const items = await scanAll(TABLE);
    const filtered = items.filter(i => {
      if (query.event && i.event !== query.event) return false;
      if (query.timestamp?.$gte && new Date(i.timestamp) < new Date(query.timestamp.$gte)) return false;
      return true;
    });
    const map = {};
    for (const item of filtered) {
      const day = (item.timestamp || '').slice(0, 10);
      if (!day) continue;
      map[day] = (map[day] || 0) + 1;
    }
    return Object.entries(map)
      .map(([date, count]) => ({ _id: date, count }))
      .sort((a, b) => a._id.localeCompare(b._id));
  }

  /**
   * Top downloaded movies.
   * Returns [{ movieId, count }] sorted by count desc, limited to `limit`.
   */
  static async topDownloads(limit = 10) {
    const items = await scanAll(TABLE);
    const downloads = items.filter(i => i.event === 'download');
    const map = {};
    for (const item of downloads) {
      const mid = item.movieId;
      if (!mid) continue;
      map[mid] = (map[mid] || 0) + 1;
    }
    return Object.entries(map)
      .map(([movieId, count]) => ({ _id: movieId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Category-level counts.
   * Returns { movieId -> count } for given event type.
   */
  static async categoryCounts(event) {
    const items = await scanAll(TABLE);
    const filtered = items.filter(i => i.event === event);
    const map = {};
    for (const item of filtered) {
      const ct = item.contentType || 'movie';
      map[ct] = (map[ct] || 0) + 1;
    }
    return Object.entries(map).map(([_id, count]) => ({ _id, count }));
  }

  /** Analytics for a single movie (last 7 days) */
  static async movieAnalytics(movieId) {
    const items = await scanAll(TABLE);
    const forMovie = items.filter(i => i.movieId === movieId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalViews = forMovie.filter(i => i.event === 'view').length;
    const totalDownloads = forMovie.filter(i => i.event === 'download').length;
    const uniqueViewers = new Set(forMovie.filter(i => i.event === 'view').map(i => i.ipHash)).size;

    // Daily views (last 7 days)
    const recentViews = forMovie.filter(i => i.event === 'view' && new Date(i.timestamp) >= sevenDaysAgo);
    const dailyViewMap = {};
    for (const item of recentViews) {
      const day = (item.timestamp || '').slice(0, 10);
      dailyViewMap[day] = (dailyViewMap[day] || 0) + 1;
    }
    const dailyViews = Object.entries(dailyViewMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Daily downloads (last 7 days)
    const recentDownloads = forMovie.filter(i => i.event === 'download' && new Date(i.timestamp) >= sevenDaysAgo);
    const dailyDlMap = {};
    for (const item of recentDownloads) {
      const day = (item.timestamp || '').slice(0, 10);
      dailyDlMap[day] = (dailyDlMap[day] || 0) + 1;
    }
    const dailyDownloads = Object.entries(dailyDlMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // By quality
    const dlByQuality = {};
    for (const item of forMovie.filter(i => i.event === 'download')) {
      const q = item.quality || 'unknown';
      dlByQuality[q] = (dlByQuality[q] || 0) + 1;
    }
    const byQuality = Object.entries(dlByQuality).map(([_id, count]) => ({ _id, count }));

    return { totalViews, totalDownloads, uniqueViewers, dailyViews, dailyDownloads, byQuality };
  }
}

module.exports = Analytics;
