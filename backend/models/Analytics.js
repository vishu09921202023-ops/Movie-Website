const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    movieTitle: { type: String, default: '' },
    contentType: { type: String, default: 'movie' },
    event: {
      type: String,
      enum: ['view', 'download'],
      required: true,
    },
    quality: String,
    ipHash: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userAgent: String,
  },
  { timestamps: false }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
