// frontend/src/pages/Gallery.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useSearchParams } from 'react-router-dom';
import { toastError } from '../lib/toast.js';

const CATEGORIES = ['Nature', 'Abstract', 'Minimal', 'Technology', 'Animals', 'Holiday'];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1', 10);

  const setParam = (key, val) => {
    const p = new URLSearchParams(params);
    if (!val) p.delete(key); else p.set(key, val);
    // reset page on filter/sort/search change
    if (['category', 'q', 'sort'].includes(key)) p.delete('page');
    setParams(p, { replace: true });
  };

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    if (sort) p.set('sort', sort);
    if (page > 1) p.set('page', String(page));
    p.set('limit', '12');
    return `?${p.toString()}`;
  }, [q, category, sort, page]);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr('');
    api.get(`/api/products/search${queryString}`)
      .then(({ data }) => {
        if (!ok) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch(e => {
        if (!ok) return;
        setErr(e?.response?.data?.message || 'Failed to load products');
        toastError('Failed to load products');
      })
      .finally(() => ok && setLoading(false));
    return () => { ok = false; };
  }, [queryString]);

  const buy = async (item) => {
    try {
      sessionStorage.setItem('lastProductId', item._id);
      const { data } = await api.post('/api/checkout/create-session', { productId: item._id });
      window.location.href = data.url;
    } catch {
      toastError('Could not start checkout. Please try again.');
    }
  };

  const nextPage = () => setParam('page', String(Math.min(page + 1, pages)));
  const prevPage = () => setParam('page', String(Math.max(page - 1, 1)));

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-3xl text-gray-600 font-bold">ScreenTones</h1>
        <p className="text-gray-600 mt-1">Capture Your Tone.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-800">Category:</label>
          <select
            className="border rounded px-3 py-2 bg-white text-gray-800"
            value={category}
            onChange={(e)=> setParam('category', e.target.value)}
          >
            <option value="">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {category && (
            <button
              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 transition"
              onClick={()=> setParam('category','')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-800">Search:</label>
          <input
            value={q}
            onChange={(e)=> setParam('q', e.target.value)}
            className="border rounded px-3 py-2 bg-white text-gray-800"
            placeholder="Search wallpapers"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-800">Sort:</label>
          <select
            className="border rounded px-3 py-2 bg-white text-gray-800"
            value={sort}
            onChange={(e)=> setParam('sort', e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low → High</option>
            <option value="priceDesc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading && <div className="py-16 text-center text-gray-500">Loading wallpapers…</div>}
      {!loading && err && <div className="py-10 text-center text-red-600">{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          No wallpapers{category ? ` in “${category}”` : ''}{q ? ` matching “${q}”` : ''}.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <>
          <div className="mb-3 text-sm text-gray-600">
            Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total}
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map(it => <ProductCard key={it._id} item={it} onBuy={buy} />)}
          </div>

          {/* Pager */}
          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <span className="text-gray-700 text-sm">Page {page} of {pages}</span>
              <button
                onClick={nextPage}
                disabled={page >= pages}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}




