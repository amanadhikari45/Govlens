import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(cfg => {
  try {
    const raw = localStorage.getItem('gl_user');
    if (raw) {
      const { accessToken } = JSON.parse(raw);
      if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (_) {}
  return cfg;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const raw = localStorage.getItem('gl_user');
        if (raw) {
          const { refreshToken } = JSON.parse(raw);
          const res = await axios.post(`${BASE}/auth/refresh`, refreshToken, {
            headers: { 'Content-Type': 'application/json' },
          });
          const user = JSON.parse(raw);
          user.accessToken = res.data.accessToken;
          user.refreshToken = res.data.refreshToken;
          localStorage.setItem('gl_user', JSON.stringify(user));
          orig.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(orig);
        }
      } catch (_) {
        localStorage.removeItem('gl_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
