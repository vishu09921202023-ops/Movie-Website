import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const movieAPI = {
  getMovies: (params?: any) => client.get('/movies', { params }),
  getTrending: (params?: any) => client.get('/movies/trending', { params }),
  getFeatured: () => client.get('/movies/featured'),
  getBySlug: (slug: string) => client.get(`/movies/${slug}`),
  recordView: (id: string) => client.post(`/movies/${id}/view`),
  download: (id: string, quality: string) =>
    client.post(`/movies/${id}/download`, { quality }),
  getSiteLinks: () => client.get('/movies/sitelinks/public'),
};

export const adminAPI = {
  login: (username: string, password: string) =>
    client.post('/admin/login', { username, password }),
  getMovies: (params?: any) => client.get('/admin/movies', { params }),
  createMovie: (data: any) => client.post('/admin/movies', data),
  updateMovie: (id: string, data: any) => client.put(`/admin/movies/${id}`, data),
  deleteMovie: (id: string) => client.delete(`/admin/movies/${id}`),
  getAnalytics: () => client.get('/admin/analytics'),
  getSiteLinks: () => client.get('/admin/sitelinks'),
  createSiteLink: (data: any) => client.post('/admin/sitelinks', data),
  updateSiteLink: (id: string, data: any) =>
    client.put(`/admin/sitelinks/${id}`, data),
  deleteSiteLink: (id: string) => client.delete(`/admin/sitelinks/${id}`),
};

export default client;
