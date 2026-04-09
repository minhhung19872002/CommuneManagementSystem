import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Suppress console noise for non-critical 403s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Re-throw 403 and 401 so callers can handle them
      if (error.response?.status === 403 || error.response?.status === 401) {
        return Promise.reject(error);
      }
      // Other errors — re-throw
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default api;
