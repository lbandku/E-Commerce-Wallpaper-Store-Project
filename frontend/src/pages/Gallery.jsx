import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useSearchParams } from 'react-router-dom';
import { toastError } from '../lib/toast.js';
import { Input, Select, BtnSecondary } from "../components/ui/Primitives.jsx";

const CATEGORIES = ['Nature', 'Abstract', 'Technology', 'Animals', 'Holiday'];
const PAGE_SIZE = 12;

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
    if (['category', 'q', 'sort'].includes(key)) p.delete('page');
    setParams(p, { replace: true });
  };

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    if (sort) p.set('sort', sort);
    if (page > 1) p.set('page', String(page));
    p.set('limit', String(PAGE_SIZE));
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
        if ((data.pages || 1) < page) {
          const p = new URLSearchParams(params);
          p.set('page', '1');
          setParams(p, { replace: true });
        }
      })
      .catch(e => {
        if (!ok) return;
        const msg = e?.response?.data?.message || 'Failed to load products';
        setErr(msg);
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

  const pagerBtn =
    "group inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg,20px)] text-sm font-semibold " +
    "border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)] " +
    "text-[var(--brand,#2E6F6C)] hover:text-[var(--brand-600,#2F6657)] " +
    "hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,var(--surface,#fff))] " +
    "transition shadow-sm hover:shadow ring-offset-2 ring-offset-[var(--bg,#F8FAFC)] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--brand,#2E6F6C)] hover:ring-2 hover:ring-[var(--brand,#2E6F6C)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <main className="px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header with subtitle + green underline */}
      <div className="text-center mb-5 sm:mb-6">
        <style>{`
          .gallery-subtitle { color: #374151 !important; }         /* light */
          .dark .gallery-subtitle { color: #d1d5db !important; }   /* dark */
        `}</style>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)]">
          Wallpaper Gallery
        </h1>
        <p className="gallery-subtitle mt-2 max-w-2xl mx-auto">
          Curated digital wallpapers—download in crisp, device-ready sizes.
        </p>
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-[3px] w-32 sm:w-36 lg:w-40 rounded-full bg-[var(--brand,#2E6F6C)]/85"
        />
      </div>

      {/* Controls */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 items-end">
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm text-[var(--muted)]">Category:</label>
          <Select value={category} onChange={(e)=> setParam('category', e.target.value)} className="w-full">
            <option value="">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          {category && (
            <BtnSecondary onClick={()=> setParam('category','')} className="h-[42px] shrink-0">Clear</BtnSecondary>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm text-[var(--muted)]">Search:</label>
          <Input
            icon="bx-search"
            value={q}
            onChange={(e)=> setParam('q', e.target.value)}
            placeholder="Search wallpapers"
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm text-[var(--muted)]">Sort:</label>
          <Select value={sort} onChange={(e)=> setParam('sort', e.target.value)} className="w-full">
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low → High</option>
            <option value="priceDesc">Price: High → Low</option>
          </Select>
        </div>
      </section>

      {/* Status / Count */}
      <div className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
        {loading ? "Loading wallpapers…" : err ? "" : `Showing ${start}–${end} of ${total}`}
      </div>

      {/* Results */}
      <section className="mt-4">
        {err && !loading && (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger,#ef4444)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger,#ef4444)_12%,transparent)] text-[var(--danger,#ef4444)] p-4 text-center">
            {err}
          </div>
        )}

        {loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border,#E5E7EB)]/20 bg-white/5 h-80 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !err && items.length === 0 && (
          <div className="rounded-xl border border-[var(--border,#E5E7EB)]/20 bg-white/5 text-[var(--muted)] p-8 text-center">
            No wallpapers{category ? ` in “${category}”` : ''}{q ? ` matching “${q}”` : ''}.
          </div>
        )}

        {!loading && !err && items.length > 0 && (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it, idx) => (
                <ProductCard
                  key={it._id}
                  item={it}
                  onBuy={buy}
                  priority={idx < 3} 
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button onClick={prevPage} disabled={page <= 1} className={pagerBtn} aria-label="Previous page">
                  <i className="bx bx-chevron-left text-lg transform transition-transform group-hover:-translate-x-0.5" />
                  Prev
                </button>

                <span className="text-[var(--muted)] text-sm">Page {page} of {pages}</span>

                <button onClick={nextPage} disabled={page >= pages} className={pagerBtn} aria-label="Next page">
                  Next
                  <i className="bx bx-chevron-right text-lg transform transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
