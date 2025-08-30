import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useSearchParams } from 'react-router-dom';
import { toastError } from '../lib/toast.js';

const CATEGORIES = ['Nature', 'Abstract', 'Technology', 'Animals', 'Holiday'];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';

  const setCategory = (next) => {
    const p = new URLSearchParams(params);
    if (!next) p.delete('category'); else p.set('category', next);
    setParams(p, { replace: true });
  };

  const q = useMemo(() => (category ? `?category=${encodeURIComponent(category)}` : ''), [category]);

  useEffect(() => {
    let ok = true;
    setLoading(true); setErr('');
    api.get(`/products${q}`)
      .then(({ data }) => ok && setItems(data))
      .catch(e => ok && setErr(e?.response?.data?.message || 'Failed to load products'))
      .finally(() => ok && setLoading(false));
    return () => { ok = false; };
  }, [q]);

  const buy = async (item) => {
    try {
      const { data } = await api.post('/checkout/create-session', { productId: item._id });
      window.location.href = data.url;
    } catch (e) {
      toastError('Could not start checkout. Please try again.');
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-3xl text-gray-600 font-bold">ScreenTones</h1>
        <p className="text-gray-600 mt-1">Capture Your Tone.</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <label className="text-sm text-gray-800">Filter by category:</label>
        <select className="border rounded px-3 py-2 bg-white text-gray-800" value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {category && (
          <button className="w-full sm:w-auto px-3 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm" onClick={()=>setCategory('')}>Clear</button>
        )}
      </div>

      {loading && <div className="py-16 text-center text-gray-500">Loading wallpapers…</div>}
      {!loading && err && <div className="py-10 text-center text-red-600">{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          No wallpapers{category ? ` in “${category}”` : ''}.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map(it => <ProductCard key={it._id} item={it} onBuy={buy} />)}
        </div>
      )}
    </>
  );
}
