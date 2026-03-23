const express = require('express');
const jwt = require('jsonwebtoken');
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

router.post('/movies', verifyToken, async (req, res) => {
  try {
    const data = movieSchema.parse(req.body);
    const slug = data.cleanTitle.toLowerCase().replace(/\s+/g, '-');

    const movie = new Movie({
      ...data,
      slug,
      postedAt: new Date(),
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input' });
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
      return res.status(400).json({ error: 'Invalid input' });
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

    const dailyViews = await Analytics.aggregate([
      {
        $match: {
          event: 'view',
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const topMovies = await Analytics.aggregate([
      {
        $match: { event: 'download' },
      },
      {
        $group: {
          _id: '$movieId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
    ]);

    const totalMovies = await Movie.countDocuments();
    const totalViews = await Analytics.countDocuments({ event: 'view' });
    const totalDownloads = await Analytics.countDocuments({ event: 'download' });
    const totalAnime = await Movie.countDocuments({ type: 'anime' });

    res.json({
      stats: { totalMovies, totalViews, totalDownloads, totalAnime },
      dailyViews,
      topMovies,
    });
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

module.exports = router;
