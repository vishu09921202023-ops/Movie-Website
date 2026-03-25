const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Admin = require('../models/Admin');
const Analytics = require('../models/Analytics');
const SiteLink = require('../models/SiteLink');
const { verifyToken } = require('../middleware/auth');
const { movieSchema, loginSchema, siteLinkSchema } = require('../middleware/validate');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ token, admin: { id: admin._id, username: admin.username } });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/movies', verifyToken, async (req, res) => {
  try {
    const { page = 1, search } = req.query;
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;

    let query = {};
    if (search) {
      query = { title: { $regex: search, $options: 'i' } };
    }

    const movies = await Movie.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      pagination: { page: parseInt(page), limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/movies/:id', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/movies', verifyToken, async (req, res) => {
  try {
    const data = movieSchema.parse(req.body);
    const slug = data.cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const movie = new Movie({
      ...data,
      type: data.categories?.length ? data.categories[0] : (data.type || 'movie'),
      slug: slug || `movie-${Date.now()}`,
      postedAt: new Date(),
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/movies/:id', verifyToken, async (req, res) => {
  try {
    const data = movieSchema.parse(req.body);
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/movies/:id', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const dailyViews = await Analytics.aggregate([
      { $match: { event: 'view', timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyDownloads = await Analytics.aggregate([
      { $match: { event: 'download', timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const topMovies = await Analytics.aggregate([
      { $match: { event: 'download' } },
      { $group: { _id: '$movieId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
    ]);

    const [totalMovies, totalSeries, totalAnime, totalKdrama, totalDocumentary] = await Promise.all([
      Movie.countDocuments({ type: 'movie' }),
      Movie.countDocuments({ type: 'series' }),
      Movie.countDocuments({ type: 'anime' }),
      Movie.countDocuments({ type: 'kdrama' }),
      Movie.countDocuments({ type: 'documentary' }),
    ]);
    const totalAll = await Movie.countDocuments();
    const totalViews = await Analytics.countDocuments({ event: 'view' });
    const totalDownloads = await Analytics.countDocuments({ event: 'download' });
    const todayViews = await Analytics.countDocuments({ event: 'view', timestamp: { $gte: todayStart } });
    const todayDownloads = await Analytics.countDocuments({ event: 'download', timestamp: { $gte: todayStart } });
    const uniqueVisitors = await Analytics.distinct('ipHash', { event: 'view' });

    // Per-category views
    const categoryViews = await Analytics.aggregate([
      { $match: { event: 'view' } },
      { $group: { _id: '$contentType', count: { $sum: 1 } } },
    ]);
    const categoryDownloads = await Analytics.aggregate([
      { $match: { event: 'download' } },
      { $group: { _id: '$contentType', count: { $sum: 1 } } },
    ]);

    const catViewMap = {};
    categoryViews.forEach(c => { catViewMap[c._id || 'movie'] = c.count; });
    const catDlMap = {};
    categoryDownloads.forEach(c => { catDlMap[c._id || 'movie'] = c.count; });

    res.json({
      stats: {
        totalAll, totalMovies, totalSeries, totalAnime, totalKdrama, totalDocumentary,
        totalViews, totalDownloads, todayViews, todayDownloads,
        uniqueVisitors: uniqueVisitors.length,
      },
      categories: {
        movie: { count: totalMovies, views: catViewMap.movie || 0, downloads: catDlMap.movie || 0 },
        series: { count: totalSeries, views: catViewMap.series || 0, downloads: catDlMap.series || 0 },
        anime: { count: totalAnime, views: catViewMap.anime || 0, downloads: catDlMap.anime || 0 },
        kdrama: { count: totalKdrama, views: catViewMap.kdrama || 0, downloads: catDlMap.kdrama || 0 },
        documentary: { count: totalDocumentary, views: catViewMap.documentary || 0, downloads: catDlMap.documentary || 0 },
      },
      dailyViews,
      dailyDownloads,
      topMovies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Per-category content listing with search
router.get('/content/:type', verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, search } = req.query;
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;
    let query = { type };
    if (search) query.title = { $regex: search, $options: 'i' };

    const items = await Movie.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Movie.countDocuments(query);

    res.json({
      items,
      pagination: { page: parseInt(page), limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Per-movie detailed analytics
router.get('/analytics/movie/:id', verifyToken, async (req, res) => {
  try {
    const movieObjId = new mongoose.Types.ObjectId(req.params.id);
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const movie = await Movie.findById(movieObjId);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const [totalViews, totalDownloads, uniqueViewers, dailyViews, dailyDownloads, byQuality] = await Promise.all([
      Analytics.countDocuments({ movieId: movieObjId, event: 'view' }),
      Analytics.countDocuments({ movieId: movieObjId, event: 'download' }),
      Analytics.distinct('ipHash', { movieId: movieObjId, event: 'view' }),
      Analytics.aggregate([
        { $match: { movieId: movieObjId, event: 'view', timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Analytics.aggregate([
        { $match: { movieId: movieObjId, event: 'download', timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Analytics.aggregate([
        { $match: { movieId: movieObjId, event: 'download' } },
        { $group: { _id: '$quality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      movie: { _id: movie._id, title: movie.title, cleanTitle: movie.cleanTitle, type: movie.type, posterUrl: movie.posterUrl, releaseYear: movie.releaseYear, quality: movie.quality, genres: movie.genres, language: movie.language, views: movie.views, slug: movie.slug },
      analytics: {
        totalViews,
        totalDownloads,
        uniqueViewers: uniqueViewers.length,
        dailyViews: dailyViews.map(d => ({ date: d._id, count: d.count })),
        dailyDownloads: dailyDownloads.map(d => ({ date: d._id, count: d.count })),
        byQuality,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search movies with analytics data
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json({ results: [] });

    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { cleanTitle: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ]
    }).limit(20).select('_id title cleanTitle type categories releaseYear posterUrl views');

    // Attach analytics counts
    const results = await Promise.all(movies.map(async (m) => {
      const [viewCount, dlCount] = await Promise.all([
        Analytics.countDocuments({ movieId: m._id, event: 'view' }),
        Analytics.countDocuments({ movieId: m._id, event: 'download' }),
      ]);
      return { ...m.toObject(), analyticsViews: viewCount, analyticsDownloads: dlCount };
    }));

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sitelinks', verifyToken, async (req, res) => {
  try {
    const links = await SiteLink.find().sort({ row: 1, order: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sitelinks', verifyToken, async (req, res) => {
  try {
    const data = siteLinkSchema.parse(req.body);
    const link = new SiteLink(data);
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/sitelinks/:id', verifyToken, async (req, res) => {
  try {
    const data = siteLinkSchema.parse(req.body);
    const link = await SiteLink.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json(link);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/sitelinks/:id', verifyToken, async (req, res) => {
  try {
    const link = await SiteLink.findByIdAndDelete(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Click Analytics Routes ───────────────────────────────────────────────────

function buildDateFilter(range) {
  const since = new Date();
  if (range === 'today') { since.setHours(0, 0, 0, 0); return { $gte: since }; }
  if (range === 'week') { since.setDate(since.getDate() - 7); return { $gte: since }; }
  if (range === 'month') { since.setDate(since.getDate() - 30); return { $gte: since }; }
  return null;
}

// Overview: today / week / month totals + top content
router.get('/clicks/overview', verifyToken, async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(); monthStart.setDate(monthStart.getDate() - 30);

    const [today, week, month, topContent] = await Promise.all([
      Analytics.countDocuments({ event: 'download', timestamp: { $gte: todayStart } }),
      Analytics.countDocuments({ event: 'download', timestamp: { $gte: weekStart } }),
      Analytics.countDocuments({ event: 'download', timestamp: { $gte: monthStart } }),
      Analytics.aggregate([
        { $match: { event: 'download' } },
        { $group: { _id: '$movieId', title: { $first: '$movieTitle' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    res.json({ today, week, month, topContent: topContent[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Breakdown by content type
router.get('/clicks/by-type', verifyToken, async (req, res) => {
  try {
    const { range = 'all' } = req.query;
    const match = { event: 'download' };
    const dateFilter = buildDateFilter(range);
    if (dateFilter) match.timestamp = dateFilter;

    const result = await Analytics.aggregate([
      { $match: match },
      { $group: { _id: '$contentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top clicked content
router.get('/clicks/top', verifyToken, async (req, res) => {
  try {
    const { limit = 10, type = 'all', range = 'all' } = req.query;
    const match = { event: 'download' };
    if (type !== 'all') match.contentType = type;
    const dateFilter = buildDateFilter(range);
    if (dateFilter) match.timestamp = dateFilter;

    const result = await Analytics.aggregate([
      { $match: match },
      { $group: {
        _id: '$movieId',
        title: { $first: '$movieTitle' },
        contentType: { $first: '$contentType' },
        totalClicks: { $sum: 1 },
        lastClicked: { $max: '$timestamp' },
      }},
      { $sort: { totalClicks: -1 } },
      { $limit: parseInt(limit) },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Per-movie detail: total clicks + 7-day daily breakdown + quality breakdown
router.get('/clicks/movie/:movieId', verifyToken, async (req, res) => {
  try {
    const movieObjId = new mongoose.Types.ObjectId(req.params.movieId);
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalClicks, daily, byQuality, movieInfo] = await Promise.all([
      Analytics.countDocuments({ movieId: movieObjId, event: 'download' }),
      Analytics.aggregate([
        { $match: { movieId: movieObjId, event: 'download', timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Analytics.aggregate([
        { $match: { movieId: movieObjId, event: 'download' } },
        { $group: { _id: '$quality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.findOne({ movieId: movieObjId }, { movieTitle: 1, contentType: 1 }),
    ]);

    res.json({ totalClicks, daily, byQuality, movieInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export CSV
router.get('/clicks/export', verifyToken, async (req, res) => {
  try {
    const { type = 'all', range = 'all' } = req.query;
    const match = { event: 'download' };
    if (type !== 'all') match.contentType = type;
    const dateFilter = buildDateFilter(range);
    if (dateFilter) match.timestamp = dateFilter;

    const result = await Analytics.aggregate([
      { $match: match },
      { $group: {
        _id: '$movieId',
        title: { $first: '$movieTitle' },
        contentType: { $first: '$contentType' },
        totalClicks: { $sum: 1 },
        lastClicked: { $max: '$timestamp' },
      }},
      { $sort: { totalClicks: -1 } },
    ]);

    const rows = [
      'Rank,Title,Type,Total Clicks,Last Clicked',
      ...result.map((r, i) =>
        `${i + 1},"${(r.title || '').replace(/"/g, '""')}",${r.contentType || 'movie'},${r.totalClicks},${r.lastClicked ? new Date(r.lastClicked).toISOString() : ''}`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="click-analytics.csv"');
    res.send(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
