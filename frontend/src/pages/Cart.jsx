import React, { useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import api from '../lib/api.js';
import { toastSuccess, toastError } from '../lib/toast.js';
import { Link, useNavigate } from 'react-router-dom';

const fmt = (cents) =>
  (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const getProductId = (it) => it?._id || it?.product?._id || it?.id || it?.productId || null;
const getQty = (it) => {
  const q = Number(it?.qty ?? it?.quantity ?? 1);
  return Number.isFinite(q) && q > 0 ? q : 1;
};
const getImageUrl = (it) =>
  it?.imageUrl || it?.image || (Array.isArray(it?.images) ? (it.images[0]?.url || it.images[0]) : '') || '';

export default function Cart() {
  const { cart = [], remove, clear } = useCart();
  const nav = useNavigate();

  const normalized = cart.map((it) => ({
    ...it,
    _pid: getProductId(it),
    _qty: getQty(it),
  })).filter((it) => !!it._pid);

  const subtotal = useMemo(
    () => normalized.reduce((sum, it) => sum + (Number(it?.price) || 0) * it._qty, 0),
    [normalized]
  );

  // Single-product checkout
  const buyItem = async (item) => {
    try {
      const productId = getProductId(item);
      if (!productId) throw new Error('No product id');
      const { data } = await api.post('/api/checkout/create-session', { productId });
      if (data?.url) { window.location.href = data.url; return; }
      toastError('Checkout did not return a redirect URL.');
    } catch (e) {
      console.error('buyItem error', e);
      toastError('Could not start checkout session');
    }
  };

  // Multi-item checkout
  const checkoutCart = async () => {
    try {
      if (!normalized.length) { toastError('Cart is empty'); return; }
      const items = normalized.map((it) => ({ productId: it._pid, qty: it._qty }));

      const attempts = [
        { url: '/api/checkout/create-cart-session', body: { items } },
        { url: '/api/checkout/create-session', body: { items } },
        { url: '/api/checkout/create-session', body: { productId: items[0].productId } },
      ];

      let data = null;
      for (const a of attempts) {
        try { const r = await api.post(a.url, a.body); if (r?.data) { data = r.data; break; } } catch {}
      }
      if (!data) throw new Error('No checkout response');
      if (data?.url) { window.location.href = data.url; return; }
      toastError('Checkout did not return a redirect URL.');
    } catch (e) {
      console.error('checkoutCart error', e);
      toastError('Could not start checkout session');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        {/* Made visible in dark mode */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text,#1A1A1A)]">
          Your Cart
        </h1>

        <div className="flex gap-2">
          {/* Styled like "Clear cart" */}
          <button
            type="button"
            onClick={() => nav('/')}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Continue shopping
          </button>

          {normalized.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (clear) { clear(); toastSuccess('Cart cleared'); }
                else toastError('Clear action not available');
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              Clear cart
            </button>
          )}
        </div>
      </header>

      {!normalized.length ? (
        <div className="py-16 text-center text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {normalized.map((it, idx) => (
              <li
                key={it._pid ?? `${it.title}-${idx}`}
                className="bg-white rounded-xl shadow p-4 flex flex-col"
              >
                {/* THUMB with quantity badge */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 rounded mb-3">
                  <img
                    src={getImageUrl(it)}
                    alt={it.title || 'Wallpaper'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Show badge only when quantity > 1 */}
                  {it._qty > 1 && (
                    <span
                      className="absolute top-2 right-2 min-w-[28px] h-7 px-2 inline-flex items-center justify-center
                                 rounded-full text-xs font-extrabold bg-gray-900 text-white/95
                                 border border-white/20 shadow"
                      aria-label={`Quantity ${it._qty}`}
                      title={`Quantity ${it._qty}`}
                    >
                      ×{it._qty}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900">{it.title || 'Wallpaper'}</h3>
                {it.category && (
                  <p className="text-xs uppercase tracking-wide text-gray-600 mt-0.5">{it.category}</p>
                )}

                {/* Price only (quantity shown by badge) */}
                <p className="mt-1 text-gray-900 font-medium">{fmt(it.price ?? 0)}</p>

                {it.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{it.description}</p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => buyItem(it)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pid = getProductId(it);
                      if (remove && pid) { remove(pid); toastSuccess('Removed'); }
                      else toastError('Remove action not available');
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between bg-white rounded-xl border p-4">
            <div className="text-gray-700">
              <p className="text-sm">Subtotal</p>
              <p className="text-xl font-semibold text-gray-900">{fmt(subtotal)}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={checkoutCart}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
