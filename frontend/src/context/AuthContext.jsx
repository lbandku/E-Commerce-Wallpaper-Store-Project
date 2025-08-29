import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../lib/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jwt') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');

  useEffect(() => { setAuthToken(token); }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    localStorage.setItem('jwt', data.token);
    // Minimal: treat login as admin for dashboard access after seeding
    setRole('admin'); localStorage.setItem('role','admin');
  };

  const logout = () => {
    setToken(null); setRole('user');
    localStorage.removeItem('jwt'); localStorage.removeItem('role');
    setAuthToken(null);
  };

  return (
    <AuthCtx.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}


