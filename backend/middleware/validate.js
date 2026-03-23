const { z } = require('zod');

const movieSchema = z.object({
  title: z.string().min(5),
  cleanTitle: z.string().min(2),
  description: z.string().optional(),
  posterUrl: z.string().url().optional(),
  backdropUrl: z.string().url().optional(),
  releaseDate: z.string().datetime().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  source: z
    .enum(['WEB-DL', 'BluRay', 'WEBRip', 'HDCAM', 'DVDRIP', 'HDTV'])
    .optional(),
  audioLanguages: z.array(z.string()).optional(),
  type: z
    .enum(['movie', 'series', 'anime', 'kdrama', 'documentary', 'wwe'])
    .optional(),
  ottPlatform: z
    .enum([
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
    ])
    .optional(),
  genres: z.array(z.string()).optional(),
  qualities: z.array(z.string()).optional(),
  downloadLinks: z
    .array(
      z.object({
        quality: z.string(),
        size: z.string(),
        url: z.string().url(),
        label: z.string(),
      })
    )
    .optional(),
  imdbRating: z.number().min(0).max(10).optional(),
  duration: z.string().optional(),
  isTrending: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isAdult: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const downloadSchema = z.object({
  quality: z.string(),
});

const siteLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  color: z.string(),
  icon: z.string().optional(),
  row: z.number().int().min(1).max(2),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  movieSchema,
  loginSchema,
  downloadSchema,
  siteLinkSchema,
};
