// frontend/src/lib/api.js
import axios from "axios";
import { API_BASE } from "./apiBase.js";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // keep if backend uses cookies; works with Bearer too
  headers: { "Content-Type": "application/json" },
});

// Read token from whichever key app uses
function getToken() {
  return (
    localStorage.getItem("token") || // common in app
    localStorage.getItem("jwt")   || // current attempt
    localStorage.getItem("authToken") || // extra fallback
    ""
  );
}

// Attach latest token (helps after Stripe redirect/refresh)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

export default api;
export { api };
