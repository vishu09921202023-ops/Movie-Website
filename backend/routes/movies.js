const express = require('express');
const Movie = require('../models/Movie');
const Analytics = require('../models/Analytics');
const SiteLink = require('../models/SiteLink');
const { downloadLimiter } = require('../middleware/rateLimit');
const { downloadSchema } = require('../middleware/validate');
const crypto = require('crypto');

const router = express.Router();

const hashIP = (ip) => {
  const normalized = (ip || '127.0.0.1').replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1');
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

router.get('/', async (req, res) => {
  try {
    const { type, genre, year, quality, ott, search, page = 1, limit = 20, sort = 'latest' } = req.query;

    let query = {};
    if (type) query.$or = [{ type }, { categories: type }];
    if (ott) query.ottPlatform = ott;
    if (year) query.releaseYear = parseInt(year);
    if (genre) query.genres = genre;
    if (quality) query.qualities = quality;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { cleanTitle: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { postedAt: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'rating') sortOption = { imdbRating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movies = await Movie.find(query, { sort: sortOption, skip, limit: parseInt(limit) });
    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movies = await Movie.find({ isTrending: true }, { sort: { postedAt: -1 }, skip, limit: parseInt(limit) });
    const total = await Movie.countDocuments({ isTrending: true });
    res.json({
      movies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const movies = await Movie.find({ isFeatured: true }, { limit: 10 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sitelinks/public', async (req, res) => {
  try {
    const links = await SiteLink.find({ isActive: true }, { sort: { row: 1, order: 1 } });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const ipHash = hashIP(req.ip);
    const movieId = req.params.id;

    const { isNew } = await Analytics.recordUniqueView(movieId, ipHash, req.headers['user-agent']);

    if (isNew) {
      const movie = await Movie.findByIdAndUpdate(movieId, { $inc: { views: 1 } }, { new: true });
      res.json({ views: movie?.views || 0, unique: true });
    } else {
      const movie = await Movie.findById(movieId);
      res.json({ views: movie?.views || 0, unique: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/download', downloadLimiter, async (req, res) => {
  try {
    const { quality } = downloadSchema.parse(req.body);
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const link = movie.downloadLinks?.find((l) => l.quality === quality);
    if (!link) {
      return res.status(404).json({ error: 'Quality not available' });
    }

    const ipHash = hashIP(req.ip);
    await Analytics.create({
      movieId: req.params.id,
      movieTitle: movie.cleanTitle || movie.title || '',
      contentType: movie.type || 'movie',
      event: 'download',
      quality,
      ipHash,
      userAgent: req.headers['user-agent'],
    });

    const downloads = movie.downloads || {};
    downloads[quality] = (Number(downloads[quality]) || 0) + 1;
    await Movie.findByIdAndUpdate(req.params.id, { downloads });

    res.json({ redirectUrl: link.url });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid quality' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


const router = express.Router();

const hashIP = (ip) => {
  // Normalize IPv6/IPv4 mapped addresses to consistent format
  const normalized = (ip || '127.0.0.1').replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1');
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

router.get('/', async (req, res) => {
  try {
    const { type, genre, year, quality, ott, search, page = 1, limit = 20, sort = 'latest' } = req.query;

    let query = {};
    if (type) query.$or = [{ type }, { categories: type }];
    if (ott) query.ottPlatform = ott;
    if (year) query.releaseYear = parseInt(year);
    if (genre) query.genres = genre;
    if (quality) query.qualities = quality;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { cleanTitle: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { postedAt: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'downloads') sortOption = { 'downloads': -1 };
    if (sort === 'rating') sortOption = { imdbRating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movies = await Movie.find({ isTrending: true })
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments({ isTrending: true });

    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const movies = await Movie.find({ isFeatured: true }).limit(10);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const ipHash = hashIP(req.ip);
    const movieId = req.params.id;

    // Atomic upsert: only creates if this IP hasn't viewed this movie before
    const result = await Analytics.findOneAndUpdate(
      { movieId, event: 'view', ipHash },
      {
        $setOnInsert: {
          movieId,
          event: 'view',
          ipHash,
          userAgent: req.headers['user-agent'],
          timestamp: new Date(),
        }
      },
      { upsert: true, new: true, rawResult: true }
    );

    // Only increment view count if this was a NEW document (not already existing)
    if (result.lastErrorObject?.updatedExisting === false) {
      const movie = await Movie.findByIdAndUpdate(
        movieId,
        { $inc: { views: 1 } },
        { new: true }
      );
      await Analytics.findByIdAndUpdate(result.value._id, {
        movieTitle: movie?.cleanTitle || movie?.title || '',
        contentType: movie?.type || 'movie',
      });
      res.json({ views: movie?.views || 0, unique: true });
    } else {
      const movie = await Movie.findById(movieId);
      res.json({ views: movie?.views || 0, unique: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/download', downloadLimiter, async (req, res) => {
  try {
    const { quality } = downloadSchema.parse(req.body);
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const link = movie.downloadLinks.find((l) => l.quality === quality);
    if (!link) {
      return res.status(404).json({ error: 'Quality not available' });
    }

    const ipHash = hashIP(req.ip);
    await Analytics.create({
      movieId: req.params.id,
      movieTitle: movie.cleanTitle || movie.title || '',
      contentType: movie.type || 'movie',
      event: 'download',
      quality,
      ipHash,
      userAgent: req.headers['user-agent'],
    });

    const currentDownloads = (movie.downloads.get(quality) || 0) + 1;
    movie.downloads.set(quality, currentDownloads);
    await movie.save();

    res.json({ redirectUrl: link.url });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid quality' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/sitelinks/public', async (req, res) => {
  try {
    const links = await SiteLink.find({ isActive: true }).sort({ row: 1, order: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
