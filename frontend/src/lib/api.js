// frontend/src/lib/api.js
import axios from "axios";
import { API_BASE } from "./apiBase.js";   // 👈 import the helper

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // for cookies/sessions
  headers: { "Content-Type": "application/json" },
});

// Always attach latest token (helps after Stripe redirect/refresh)
api.interceptors.request.use((config) => {
  // Make sure this key matches what is stored in AuthContext (e.g., "token")
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;



