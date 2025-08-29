import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const CATEGORIES = ['Nature', 'Abstract', 'Minimal'];

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    price: 199,
    image: null,
    description: ''
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/products');
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // cleanup preview URL on unmount
    return () => preview && URL.revokeObjectURL(preview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onImageChange = (file) => {
    setForm((f) => ({ ...f, image: file || null }));
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    // Basic client-side validation
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.category.trim()) return setError('Please choose a category.');
    if (!form.price || Number(form.price) <= 0) return setError('Price must be greater than 0 (in cents).');
    if (!form.image) return setError('Please select an image file.');

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('price', String(form.price));
      fd.append('description', form.description);
      fd.append('image', form.image);

      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setForm({ title: '', category: '', price: 199, image: null, description: '' });
      if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
      setMsg('Wallpaper uploaded successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const delItem = async (id) => {
    setError('');
    setMsg('');
    try {
      await api.delete(`/products/${id}`);
      setMsg('Wallpaper deleted.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-7xl py-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Admin Dashboard</h2>

        {/* Alerts */}
        {error && <div className="mb-4 text-center text-red-600">{error}</div>}
        {msg && <div className="mb-4 text-center text-green-600">{msg}</div>}

        {/* Form */}
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow mb-8 max-w-md mx-auto">
          <h3 className="font-semibold text-lg mb-4">Add New Wallpaper</h3>

          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="border p-3 w-full mb-3 rounded"
            placeholder="e.g. Mountain Sunset"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="border p-3 w-full mb-3 rounded bg-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="block text-sm font-medium mb-1">Price (cents)</label>
          <input
            className="border p-3 w-full mb-3 rounded"
            placeholder="199"
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />

          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="border p-3 w-full mb-3 rounded"
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />

          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            className="border p-3 w-full mb-3 rounded"
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0])}
            required
          />

          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-lg"
          >
            {submitting ? 'Uploading…' : 'Upload'}
          </button>
        </form>

        {/* Product list */}
        <h3 className="text-xl font-semibold mb-4 text-center">Current Products</h3>

        {loading && <div className="text-center text-gray-500 py-6">Loading products…</div>}

        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500 py-6">No products yet.</div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {items.map((it) => (
              <div key={it._id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                <img src={it.imageUrl} alt={it.title} className="w-full h-40 object-cover" />
                <div className="p-3 text-center flex-1 flex flex-col">
                  <div className="font-semibold text-lg">{it.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {it.category} • { (it.price / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' }) }
                  </div>
                  {it.description && (
                    <p className="text-xs text-gray-500 mt-2 flex-1">{it.description}</p>
                  )}
                  <button
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    onClick={() => delItem(it._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
