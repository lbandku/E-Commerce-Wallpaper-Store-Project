import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await login(email, password); nav('/admin'); }
    catch (e) { setError('Login failed'); }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <input className="border rounded w-full p-2 mb-3" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input className="border rounded w-full p-2 mb-4" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
    </form>
  );
}


