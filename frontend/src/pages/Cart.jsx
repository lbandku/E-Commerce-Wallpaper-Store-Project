// frontend/src/pages/Cart.jsx
import React, { useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import api from '../lib/api.js';
import { toastSuccess, toastError } from '../lib/toast.js';
import { Link } from 'react-router-dom';

const fmt = (cents) =>
  (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function Cart() {
  const { cart, remove, clear } = useCart();

  const subtotal = useMemo(
    () => cart.reduce((sum, it) => sum + (Number(it?.price) || 0) * (it.qty || 1), 0),
    [cart]
  );

  const getProductId = (it) => it?._id || it?.product?._id || it?.id;

  // Buy one item now (single-product checkout)
  const buyItem = async (item) => {
    try {
      const productId = getProductId(item);
      if (!productId) throw new Error('No product id');
      const { data } = await api.post('/api/checkout/create-session', { productId });
      window.location.href = data.url;
    } catch (e) {
      console.error('buyItem error', e);
      toastError('Could not start checkout session');
    }
  };

  // Checkout entire cart (multi-item checkout)
  const checkoutCart = async () => {
    try {
      if (!cart.length) return;
      const items = cart.map((it) => ({
        productId: getProductId(it),
        qty: Number(it.qty || 1),
      })).filter(Boolean);

      if (items.length === 0) {
        toastError('Cart is empty');
        return;
      }

      const { data } = await api.post('/api/checkout/create-cart-session', { items });
      window.location.href = data.url;
    } catch (e) {
      console.error('checkoutCart error', e);
      toastError('Could not start checkout session');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
        <div className="flex gap-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Continue shopping
          </Link>
          {cart.length > 0 && (
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

      {!cart.length ? (
        <div className="py-16 text-center text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {cart.map((it, idx) => (
              <li
                key={getProductId(it) ?? `${it.title}-${idx}`}
                className="bg-white rounded-xl shadow p-4 flex flex-col"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 rounded mb-3">
                  <img
                    src={it.imageUrl}
                    alt={it.title || 'Wallpaper'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <h3 className="font-semibold text-gray-900">{it.title}</h3>
                {it.category && (
                  <p className="text-xs uppercase tracking-wide text-gray-600 mt-0.5">{it.category}</p>
                )}
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
                      if (remove) { remove(getProductId(it)); toastSuccess('Removed'); }
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



