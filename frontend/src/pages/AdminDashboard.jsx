import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toastSuccess, toastError } from '../lib/toast.js';

const CATEGORIES = ['Nature', 'Abstract', 'Technology', 'Animals', 'Holiday'];

export default function AdminDashboard() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    price: 199,
    image: null,
    description: ''
  });
  const [preview, setPreview] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/products');
      setItems(data);
    } catch (err) {
      toastError('Failed to load products');
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('description', form.description);
      if (form.image) fd.append('image', form.image);

      await api.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toastSuccess('Wallpaper uploaded');
      setForm({ title: '', category: '', price: 199, image: null, description: '' });
      setPreview(null);
      load();
    } catch (err) {
      toastError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const delItem = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toastSuccess('Wallpaper deleted');
      load();
    } catch (err) {
      toastError('Delete failed');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 text-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Admin Dashboard</h2>

      {/* Upload Form */}
      <form onSubmit={submit} className="bg-white shadow rounded-xl p-6 mb-10 text-gray-900">
        <h3 className="font-semibold mb-3 text-gray-800">Add Wallpaper</h3>

        <input
          className="border p-3 w-full mb-3 rounded text-gray-900 placeholder-gray-500"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <select
          className="border p-3 w-full mb-3 rounded text-gray-900"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          className="border p-3 w-full mb-3 rounded text-gray-900"
          placeholder="Price in cents"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <textarea
          className="border p-3 w-full mb-3 rounded text-gray-900 placeholder-gray-500"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* File input styled as a button-like control */}
        <label className="inline-block mb-3 cursor-pointer px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 transition">
          Choose Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              setForm({ ...form, image: file });
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        {preview && (
          <img src={preview} alt="preview" className="mb-3 max-h-40 rounded border" />
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {/* Product List */}
      <h3 className="font-semibold mb-3 text-gray-800">Existing Wallpapers</h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => (
          <div key={it._id} className="bg-white shadow rounded-xl p-4 text-gray-900">
            <img src={it.imageUrl} alt={it.title} className="mb-2 rounded" />
            <h4 className="font-semibold text-gray-900">{it.title}</h4>
            <p className="text-sm text-gray-700 mb-2">{it.description}</p>
            <p className="text-sm text-gray-700 mb-2">
              {it.category} — ${(it.price / 100).toFixed(2)}
            </p>
            <button
              onClick={() => delItem(it._id)}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
