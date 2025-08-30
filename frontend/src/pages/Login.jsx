import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastError } from '../lib/toast.js';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  // start empty so returning to /login shows blank fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // clear fields on success
      setEmail('');
      setPassword('');
      toastSuccess('Logged in');
      nav('/admin');
    } catch {
      setError('Login failed');
      toastError('Login failed');
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow text-gray-900"
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <label className="block text-sm text-gray-700 mb-1">Email</label>
      <input
        className="border rounded w-full p-2 mb-3 text-gray-900 placeholder-gray-500"
        type="email"
        placeholder="admin@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
      />

      <label className="block text-sm text-gray-700 mb-1">Password</label>
      <input
        className="border rounded w-full p-2 mb-4 text-gray-900 placeholder-gray-500"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        type="submit"
      >
        Login
      </button>
    </form>
  );
}
