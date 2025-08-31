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

  const submit = async (e) => {
    e.preventDefault();
    try {
      const u = await register({ email, name, password });
      toastSuccess(`Welcome, ${u.name}`);
      nav(u.role === 'admin' ? '/admin' : '/');
    } catch {
      toastError('Registration failed');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Create account</h2>
      <input
        className="border rounded w-full p-2 mb-3 text-gray-900"
        placeholder="Email"
        value={email} onChange={e=>setEmail(e.target.value)}
      />
      <input
        className="border rounded w-full p-2 mb-3 text-gray-900"
        placeholder="Name"
        value={name} onChange={e=>setName(e.target.value)}
      />
      <input
        className="border rounded w-full p-2 mb-4 text-gray-900"
        placeholder="Password" type="password"
        value={password} onChange={e=>setPassword(e.target.value)}
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
    </form>
  );
}


