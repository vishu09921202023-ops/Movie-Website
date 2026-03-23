export interface MovieDownloadLink {
  quality: string;
  size: string;
  url: string;
  label: string;
}

export interface Movie {
  _id: string;
  slug: string;
  title: string;
  cleanTitle: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
  releaseYear?: number;
  source?: 'WEB-DL' | 'BluRay' | 'WEBRip' | 'HDCAM' | 'DVDRIP' | 'HDTV';
  audioLanguages?: string[];
  type?: 'movie' | 'series' | 'anime' | 'kdrama' | 'documentary' | 'wwe';
  ottPlatform?: string;
  genres?: string[];
  qualities?: string[];
  downloadLinks?: MovieDownloadLink[];
  imdbRating?: number;
  duration?: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  isAdult?: boolean;
  views?: number;
  downloads?: Record<string, number>;
  tags?: string[];
  postedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MovieResponse {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SiteLink {
  _id: string;
  label: string;
  url: string;
  color: string;
  icon?: string;
  row: number;
  order: number;
  isActive: boolean;
}

export interface AdminStats {
  totalMovies: number;
  totalViews: number;
  totalDownloads: number;
  totalAnime: number;
}

export interface AnalyticsData {
  stats: AdminStats;
  dailyViews: Array<{ _id: string; count: number }>;
  topMovies: any[];
}
