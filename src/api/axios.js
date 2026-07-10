import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — attempt token refresh (only once, never retry refresh/logout itself)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't retry if already retried, or if it's an auth endpoint itself
    const isAuthEndpoint = original.url?.includes('/auth/refresh') ||
                           original.url?.includes('/auth/login') ||
                           original.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Redirect to appropriate login
        const isCFO = window.location.pathname.startsWith('/cfo');
        window.location.href = isCFO ? '/cfo/login' : '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
