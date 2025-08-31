import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toastError } from '../lib/toast.js';


const formatPrice = (cents) =>
  (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso || '—';
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/orders'); // <-- requires JWT
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load orders');
      toastError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-7xl py-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-gray-500">Loading orders…</div>
        )}

        {!loading && err && (
          <div className="py-10 text-center text-red-600">{err}</div>
        )}

        {!loading && !err && orders.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            No orders yet. Complete a Stripe test checkout to see entries here.
          </div>
        )}

        {!loading && !err && orders.length > 0 && (
          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                    Order / Session
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                    Product
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                    Buyer
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => {
                  // Flexible field access based on typical shapes
                  const idShort =
                    (o._id?.slice?.(0, 6) || o.id?.slice?.(0, 6) || '—') +
                    (o._id || o.id ? '…' : '');
                  const sessionShort =
                    o.stripeSessionId
                      ? o.stripeSessionId.slice(0, 8) + '…'
                      : '';
                  const productTitle =
                    o.product?.title || o.productTitle || '—';
                  const amount =
                    o.amount != null
                      ? formatPrice(o.amount)
                      : o.product?.price != null
                      ? formatPrice(o.product.price)
                      : '—';
                  const email = o.email || o.customerEmail || '—';
                  const status = o.status || o.paymentStatus || 'paid';
                  const date =
                    o.createdAt || o.updatedAt || o.paidAt || o.date || '';

                  return (
                    <tr key={o._id || o.id || `${o.stripeSessionId}-${date}`}>
                      <td className="px-3 py-3 text-sm text-gray-800 whitespace-nowrap">
                        {formatDate(date)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono">{idShort}</span>
                          {sessionShort && (
                            <span className="text-xs text-gray-500">
                              {sessionShort}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {productTitle}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800">{email}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">{amount}</td>
                      <td className="px-3 py-3 text-sm">
                        <span
                          className={
                            status === 'paid'
                              ? 'inline-flex rounded-full bg-green-100 px-2 py-0.5 text-green-800'
                              : status === 'unpaid' || status === 'canceled'
                              ? 'inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-gray-800'
                              : 'inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800'
                          }
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

