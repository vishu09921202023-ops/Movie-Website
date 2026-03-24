// API Configuration
// Change this to your server's IP address when running on a physical device
// Use your computer's local IP (e.g., 192.168.1.x) instead of localhost
export const API_BASE_URL = 'http://10.0.2.2:5003/api'; // Android emulator -> host machine
// export const API_BASE_URL = 'http://192.168.1.100:5003/api'; // Physical device - update IP

export const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const api = {
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async getMovies(token, page = 1, limit = 20) {
    const res = await fetch(`${API_BASE_URL}/movies?page=${page}&limit=${limit}&sort=latest`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getMovie(token, id) {
    const res = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async createMovie(token, movieData) {
    const res = await fetch(`${API_BASE_URL}/admin/movies`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(movieData),
    });
    return res.json();
  },

  async updateMovie(token, id, movieData) {
    const res = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(movieData),
    });
    return res.json();
  },

  async deleteMovie(token, id) {
    const res = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getAnalyticsOverview(token) {
    const res = await fetch(`${API_BASE_URL}/admin/analytics/overview`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getTopMovies(token, limit = 10) {
    const res = await fetch(`${API_BASE_URL}/admin/analytics/top?limit=${limit}`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getSiteLinks(token) {
    const res = await fetch(`${API_BASE_URL}/admin/sitelinks`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async createSiteLink(token, data) {
    const res = await fetch(`${API_BASE_URL}/admin/sitelinks`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteSiteLink(token, id) {
    const res = await fetch(`${API_BASE_URL}/admin/sitelinks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return res.json();
  },
};
