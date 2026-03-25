// API Configuration
// Change this to your server's IP address when running on a physical device
// Use your computer's local IP (e.g., 192.168.1.x) instead of localhost
// export const API_BASE_URL = 'http://10.0.2.2:5004/api'; // Android emulator -> host machine
export const API_BASE_URL = 'http://localhost:5000/api'; // Physical device

export const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Safe fetch: reads response as text first, then parses JSON
// Prevents crashes when server returns HTML/text instead of JSON
const safeFetch = async (url, options) => {
  let res;
  try {
    res = await fetch(url, options);
  } catch (networkErr) {
    throw new Error('Network error: Cannot reach server');
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`API error (${res.status}): ${text.substring(0, 200)}`);
  }
  // Throw on auth errors so App.js can catch and force re-login
  if (res.status === 401) {
    const err = new Error(json.error || 'Unauthorized');
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    throw new Error(json.error || `API error (${res.status})`);
  }
  return json;
};

export const api = {
  async login(username, password) {
    return safeFetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  },

  // ─── Movies CRUD ──────────────────────────────────
  async getMovies(token, page = 1) {
    const result = await safeFetch(`${API_BASE_URL}/admin/movies?page=${page}`, {
      headers: getHeaders(token),
    });
    return { data: result };
  },

  async getMovie(token, id) {
    const result = await safeFetch(`${API_BASE_URL}/admin/movies/${encodeURIComponent(id)}`, {
      headers: getHeaders(token),
    });
    return { data: result };
  },

  async createMovie(token, movieData) {
    const result = await safeFetch(`${API_BASE_URL}/admin/movies`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(movieData),
    });
    return { data: result };
  },

  async updateMovie(token, id, movieData) {
    const result = await safeFetch(`${API_BASE_URL}/admin/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(movieData),
    });
    return { data: result };
  },

  async deleteMovie(token, id) {
    return safeFetch(`${API_BASE_URL}/admin/movies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },

  // ─── Full Analytics (dashboard) ───────────────────
  async getFullAnalytics(token) {
    const data = await safeFetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getHeaders(token),
    });
    return { data };
  },

  // Backward compat
  async getAnalyticsOverview(token) {
    const data = await safeFetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getHeaders(token),
    });
    return { data: data.stats || data };
  },

  async getTopMovies(token, limit = 10) {
    const data = await safeFetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getHeaders(token),
    });
    const normalized = (data.topMovies || []).slice(0, limit).map(item => ({
      _id: item._id,
      title: item.movie?.[0]?.title || item.movie?.[0]?.cleanTitle || 'Unknown',
      movieTitle: item.movie?.[0]?.title || item.movie?.[0]?.cleanTitle || 'Unknown',
      downloads: item.count || 0,
      views: item.count || 0,
    }));
    return { data: normalized };
  },

  // ─── Category content ─────────────────────────────
  async getCategoryContent(token, type, page = 1, search = '') {
    const params = `page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    const result = await safeFetch(`${API_BASE_URL}/admin/content/${encodeURIComponent(type)}?${params}`, {
      headers: getHeaders(token),
    });
    return { data: result };
  },

  // ─── Per-movie analytics ──────────────────────────
  async getMovieAnalytics(token, movieId) {
    const result = await safeFetch(`${API_BASE_URL}/admin/analytics/movie/${encodeURIComponent(movieId)}`, {
      headers: getHeaders(token),
    });
    return { data: result };
  },

  // ─── Search with analytics ────────────────────────
  async searchMovies(token, query) {
    const result = await safeFetch(`${API_BASE_URL}/admin/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(token),
    });
    return { data: Array.isArray(result) ? result : [] };
  },

  // ─── Site Links ───────────────────────────────────
  async getSiteLinks(token) {
    const data = await safeFetch(`${API_BASE_URL}/admin/sitelinks`, {
      headers: getHeaders(token),
    });
    return { data: Array.isArray(data) ? data : data.data || [] };
  },

  async createSiteLink(token, linkData) {
    return safeFetch(`${API_BASE_URL}/admin/sitelinks`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(linkData),
    });
  },

  async deleteSiteLink(token, id) {
    return safeFetch(`${API_BASE_URL}/admin/sitelinks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },
};
