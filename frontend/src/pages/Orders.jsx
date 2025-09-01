// frontend/src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const fmtMoney = (cents) =>
  ((Number.isFinite(Number(cents)) ? Number(cents) : 0) / 100)
    .toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/orders'); // admin route
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch {
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">All Orders</h1>

      {!rows.length ? (
        <div className="py-16 text-center text-gray-500">No orders yet.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700">Order</th>
                <th className="p-3 text-left font-semibold text-gray-700">User</th>
                <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                <th className="p-3 text-left font-semibold text-gray-700">Items</th>
                <th className="p-3 text-right font-semibold text-gray-700">Total</th>
                <th className="p-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="p-3 text-gray-900 font-medium">{o._id.slice(-8)}</td>
                  <td className="p-3">
                    {o.user?.email || '—'}
                    {o.user?.name ? <span className="text-gray-600"> ({o.user.name})</span> : null}
                  </td>
                  <td className="p-3">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                  <td className="p-3">
                    {(o.items || []).map((it, i) => (
                      <span key={i} className="inline-block mr-2 text-gray-700">
                        {it.title || 'Wallpaper'}
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-900">
                    {fmtMoney(o.total)}
                  </td>
                  <td className="p-3">
                    <span className="uppercase tracking-wide text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


