// frontend/src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { toastError, toastSuccess } from '../lib/toast.js';

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // 1) Probe the role WITHOUT logging into context yet
      const { data } = await api.post('/auth/login', { email, password });
      // data should include { token, user: { role, ... } }
      if (!data?.user || data.user.role !== 'admin') {
        setError('This account is not an admin.');
        toastError('This account is not an admin.');
        setBusy(false);
        return; // <— do NOT call context.login(); user stays logged out
      }

      // 2) Now actually log in via your context (so it stores token/user uniformly)
      await login(email, password);
      toastSuccess('Admin login successful');
      nav('/admin');
    } catch {
      setError('Login failed');
      toastError('Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Admin Login</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={submit}>
        <input
          className="border rounded w-full p-2 mb-3 text-gray-900 placeholder-gray-500"
          placeholder="Admin email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          className="border rounded w-full p-2 mb-4 text-gray-900 placeholder-gray-500"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-3">
        Not an admin? <a href="/login" className="underline">User login</a>
      </p>
    </div>
  );
}


