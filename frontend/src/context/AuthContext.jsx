// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Keep axios Authorization header in sync
  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
  }, [token]);

  const saveAuth = (t, u) => {
    setToken(t || "");
    setUser(u || null);
    if (t) localStorage.setItem("token", t); else localStorage.removeItem("token");
    if (u) localStorage.setItem("user", JSON.stringify(u)); else localStorage.removeItem("user");
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      // ✅ Make sure your backend supports this path
      const { data } = await api.post("/api/auth/login", { email, password });
      // expected shape: { token, user }
      saveAuth(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password });
      // optional: auto-login after register if backend returns {token,user}
      if (data?.token && data?.user) saveAuth(data.token, data.user);
      return data.user ?? null;
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    if (!token) return null;
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch {
      // token bad/expired → clear
      saveAuth("", null);
      return null;
    }
  };

  const logout = async () => {
    // (Optional) await api.post("/api/auth/logout");
    saveAuth("", null);
  };

  useEffect(() => { fetchMe(); }, []); // keep if your backend exposes /me

  const value = useMemo(() => ({
    token, user, loading,
    login, register, logout, fetchMe
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
