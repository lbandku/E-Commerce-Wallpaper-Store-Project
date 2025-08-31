// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.js';
import { toastSuccess, toastError } from '../lib/toast.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  // helpers to sync axios header + localStorage
  const applyToken = useCallback((t) => {
    if (t) {
      localStorage.setItem('jwt', t);
      api.defaults.headers.Authorization = `Bearer ${t}`;
      setToken(t);
    } else {
      localStorage.removeItem('jwt');
      delete api.defaults.headers.Authorization;
      setToken(null);
    }
  }, []);

  // rehydrate on mount
  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) { setReady(true); return; }
    applyToken(t);
    // fetch current user
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        // token invalid -> clear it
        applyToken(null);
      } finally {
        setReady(true);
      }
    })();
  }, [applyToken]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // backend should return { token, user }
      applyToken(data.token);
      setUser(data.user || null);
      toastSuccess('Logged in');
      return data;
    } catch (e) {
      toastError(e?.response?.data?.message || 'Login failed');
      throw e;
    }
  }, [applyToken]);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      // optionally auto-login if your backend returns token
      if (data.token) {
        applyToken(data.token);
        setUser(data.user || null);
        toastSuccess('Account created');
      } else {
        toastSuccess('Account created, please log in');
      }
      return data;
    } catch (e) {
      toastError(e?.response?.data?.message || 'Registration failed');
      throw e;
    }
  }, [applyToken]);

  const logout = useCallback(() => {
    applyToken(null);
    setUser(null);
    toastSuccess('Logged out');
  }, [applyToken]);

  const value = { ready, user, token, login, register, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
