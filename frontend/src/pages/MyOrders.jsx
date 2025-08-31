import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const fmt = (cents) =>
  (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/orders/my');
        if (alive) setOrders(data || []);
      } catch (e) {
        if (alive) setErr('Failed to load orders');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="py-16 text-center text-gray-500">Loading orders…</div>;
  if (err) return <div className="py-16 text-center text-red-600">{err}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Orders</h1>

      {!orders.length ? (
        <div className="py-16 text-center text-gray-500">You don’t have any purchases yet.</div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Order:</span> {o._id.slice(-8)}
                  <span className="mx-2">•</span>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
                <div className="text-gray-900 font-semibold">{fmt(o.total)}</div>
              </div>

              <ul className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {(o.items || []).map((it, idx) => (
                  <li key={idx} className="rounded-lg border overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-100">
                      <img
                        src={it.imageUrl}
                        alt={it.title || 'Wallpaper'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-gray-900">{it.title}</p>
                      <p className="text-sm text-gray-600">{fmt(it.price)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


