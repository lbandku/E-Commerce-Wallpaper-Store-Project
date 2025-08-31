// frontend/src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
});

// Always attach latest token (helps after Stripe redirect/refresh)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt'); // <- must match AuthContext key
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});


