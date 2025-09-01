// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastError } from '../lib/toast.js';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !name || !password) {
      setError('All fields are required');
      toastError('All fields are required');
      return;
    }

    setBusy(true);
    try {
      // AuthContext.register should POST /api/auth/register
      // and return user (and optionally set token if backend returns it)
      const u = await register({ email, name, password });

      if (!u || !u.name) {
        // In case backend doesn’t return user details
        toastSuccess('Registration successful');
        nav('/'); // safe default
        return;
      }

      toastSuccess(`Welcome, ${u.name}`);
      nav(u.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed';
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Create account</h2>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <input
        className="border rounded w-full p-2 mb-3 text-gray-900 placeholder-gray-500"
        placeholder="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
      />

      <input
        className="border rounded w-full p-2 mb-3 text-gray-900 placeholder-gray-500"
        placeholder="Name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        required
      />

      <input
        className="border rounded w-full p-2 mb-4 text-gray-900 placeholder-gray-500"
        placeholder="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required
        minLength={6}
      />

      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={busy}
      >
        {busy ? 'Creating account…' : 'Register'}
      </button>
    </form>
  );
}




