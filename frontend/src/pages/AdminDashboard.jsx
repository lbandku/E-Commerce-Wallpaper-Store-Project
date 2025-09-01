// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useRef, useState } from 'react';
import api from '../lib/api.js';
import { toastError, toastSuccess } from '../lib/toast.js';

const CATEGORIES = ['Nature', 'Abstract', 'Minimal', 'Technology', 'Animals', 'Holiday'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Upload form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setError('');
    try {
      const { data } = await api.get('/api/products', { params: { sort: 'newest', limit: 100 } });
      setProducts(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load products';
      setError(msg);
      toastError(msg);
    }
  };

  const fetchOrders = async () => {
    setError('');
    try {
      const { data } = await api.get('/api/orders');
      setOrders(Array.isArray(data) ? data : data?.orders || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load orders';
      setError(msg);
      toastError(msg);
    }
  };

  useEffect(() => {
    setLoading(true);
    const loader = tab === 'products' ? fetchProducts() : fetchOrders();
    Promise.resolve(loader).finally(() => setLoading(false));
  }, [tab]);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setPriceUSD('');
    setDescription('');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!title || !category || !priceUSD || !imageFile) {
      toastError('Please complete all fields and choose an image.');
      return;
    }
    const cents = Math.round(Number(priceUSD) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      toastError('Price must be a positive number.');
      return;
    }

    const fd = new FormData();
    fd.append('title', title);
    fd.append('category', category);
    fd.append('price', String(cents));
    fd.append('description', description);
    fd.append('image', imageFile);

    setLoading(true);
    try {
      await api.post('/api/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toastSuccess('Product created');
      resetForm();
      await fetchProducts();
    } catch (e2) {
      const msg = e2?.response?.data?.message || 'Create failed';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    const yes = window.confirm('Delete this product? This cannot be undone.');
    if (!yes) return;
    setLoading(true);
    try {
      await api.delete(`/api/products/${id}`);
      toastSuccess('Deleted');
      await fetchProducts();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Delete failed';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Reusable dark button class (white text in both themes)
  const darkBtn = 'px-3 py-2 rounded border bg-gray-900 text-white hover:bg-gray-800';

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        <button
          className={darkBtn}
          onClick={() => setTab('products')}
        >
          Products
        </button>
        <button
          className={darkBtn}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
      </div>

      {loading && <div className="text-gray-600">Loading…</div>}
      {!loading && error && <div className="text-red-600 mb-4">{error}</div>}

      {/* PRODUCTS */}
      {!loading && !error && tab === 'products' && (
        <>
          {/* Upload form */}
          <form onSubmit={submitUpload} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload New Product</h2>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                className="border rounded w-full p-2 text-gray-900"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                placeholder="e.g. Mountain Dawn"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <select
                className="border rounded w-full p-2 text-gray-900 bg-white"
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Price (USD)</label>
              <input
                className="border rounded w-full p-2 text-gray-900"
                type="number" min="0" step="0.01"
                value={priceUSD}
                onChange={(e)=>setPriceUSD(e.target.value)}
                placeholder="e.g. 4.99"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea
                className="border rounded w-full p-2 text-gray-900"
                rows={3}
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Image</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e)=>setImageFile(e.target.files?.[0] || null)}
                />
                {/* Styled like Products button: dark + white text */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={darkBtn}
                >
                  Choose Image…
                </button>
                <span className="text-sm text-gray-700">
                  {imageFile ? imageFile.name : 'No file selected'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Uploading…' : 'Create'}
              </button>
              {/* Styled like Products button: dark + white text */}
              <button
                type="button"
                onClick={resetForm}
                className={darkBtn}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Product list with Delete */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium text-gray-700">Image</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Title</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Category</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Price</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Created</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-t">
                    <td className="px-3 py-2">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="h-10 w-14 object-cover rounded" />
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-900">{p.title}</td>
                    <td className="px-3 py-2 text-gray-700">{p.category}</td>
                    <td className="px-3 py-2 text-gray-900">
                      {typeof p.price === 'number'
                        ? (p.price / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
                        : p.price}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ORDERS */}
      {!loading && !error && tab === 'orders' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-gray-700">Order #</th>
                <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                <th className="px-3 py-2 font-medium text-gray-700">Product</th>
                <th className="px-3 py-2 font-medium text-gray-700">Price</th>
                <th className="px-3 py-2 font-medium text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className="border-t">
                  <td className="px-3 py-2 text-gray-900">{o._id}</td>
                  <td className="px-3 py-2 text-gray-700">{o.user?.email || '—'}</td>
                  <td className="px-3 py-2 text-gray-900">
                    {o.items?.length ? (
                      <div className="flex items-center gap-2">
                        {o.items[0].imageUrl ? (
                          <img
                            src={o.items[0].imageUrl}
                            alt={o.items[0].title || o.items[0].product?.title}
                            className="h-8 w-10 object-cover rounded"
                          />
                        ) : null}
                        <div>
                          <div className="font-medium">
                            {o.items[0].title || o.items[0].product?.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {o.items[0].product?.category || '—'}
                          </div>
                        </div>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {typeof o.total === 'number'
                      ? (o.total / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
                      : o.total}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
