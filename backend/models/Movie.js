const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    cleanTitle: {
      type: String,
      required: true,
      index: true,
    },
    description: String,
    posterUrl: String,
    backdropUrl: String,
    releaseDate: Date,
    releaseYear: {
      type: Number,
      index: true,
    },
    source: {
      type: String,
      enum: ['WEB-DL', 'BluRay', 'WEBRip', 'HDCAM', 'DVDRIP', 'HDTV'],
      default: 'WEB-DL',
    },
    audioLanguages: [String],
    type: {
      type: String,
      enum: ['movie', 'series', 'anime', 'kdrama', 'documentary', 'wwe'],
      default: 'movie',
      index: true,
    },
    categories: [{
      type: String,
      enum: ['movie', 'series', 'anime', 'kdrama', 'documentary', 'wwe'],
      index: true,
    }],
    ottPlatform: {
      type: String,
      enum: [
        'netflix',
        'amazon',
        'apple',
        'hotstar',
        'disney',
        'minitv',
        'turkish',
        'chinese',
        'discovery',
        'wwe',
        'other',
      ],
      index: true,
    },
    genres: [
      {
        type: String,
        index: true,
      },
    ],
    qualities: [String],
    downloadLinks: [
      {
        quality: String,
        size: String,
        url: String,
        label: String,
      },
    ],
    imdbRating: {
      type: Number,
      min: 0,
      max: 10,
    },
    duration: String,
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isAdult: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    tags: [String],
    screenshots: [String],
    telegramUrl: String,
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    indexes: [{ title: 'text', description: 'text', tags: 'text' }],
  }
);

module.exports = mongoose.model('Movie', movieSchema);
