import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toastError, toastSuccess } from '../lib/toast.js';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Decide where to go after login
  const redirectAfterLogin = (user) => {
    // If they were sent here from a protected page, go back there
    const from = loc.state?.from?.pathname;
    if (from) {
      // If they were trying to reach an admin route but user isn't admin, go home
      if (from.startsWith('/admin') && user?.role !== 'admin') {
        return nav('/');
      }
      return nav(from);
    }
    // Default behaviour: admin can go to /admin, users go home
    if (user?.role === 'admin') return nav('/admin');
    return nav('/');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password); // your context should store token+user
      toastSuccess('Logged in');
      redirectAfterLogin(user);
    } catch (e) {
      setError('Login failed');
      toastError('Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Login</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <form onSubmit={submit}>
        <input
          className="border rounded w-full p-2 mb-3 text-gray-900 placeholder-gray-500"
          placeholder="Email"
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
        New here? <Link to="/register" className="underline">Create an account</Link>
      </p>

      <p className="text-center text-xs text-gray-500 mt-2">
        Admin? Use <Link to="/admin-login" className="underline">Admin Login</Link>
      </p>
    </div>
  );
}


