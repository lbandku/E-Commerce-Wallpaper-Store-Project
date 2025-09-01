// frontend/src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toastError, toastSuccess } from '../lib/toast.js';

export default function AdminLogin() {
  const nav = useNavigate();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // Single source of truth: use AuthContext.login (hits /api/auth/login internally)
      const user = await login(email, password);

      if (user?.role !== 'admin') {
        // Not an admin — immediately clear any auth and show message
        await logout();
        setError('This account is not an admin.');
        toastError('This account is not an admin.');
        return;
      }

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
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <input
          className="border rounded w-full p-2 mb-4 text-gray-900 placeholder-gray-500"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-3">
        Not an admin? <Link to="/login" className="underline">User login</Link>
      </p>
    </div>
  );
}






