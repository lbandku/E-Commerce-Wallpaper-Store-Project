// frontend/src/pages/CheckoutSuccess.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toastSuccess, toastError } from '../lib/toast.js';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState('Finalizing your order…');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sessionId = params.get('session_id');
        if (!sessionId) {
          setMsg('Payment completed, but session_id is missing.');
          return;
        }
        const { data } = await api.post('/orders/confirm', { session_id: sessionId });
        if (!alive) return;
        setMsg('Your order has been saved. You can view it on the My Orders page.');
        toastSuccess('Order recorded!');
      } catch (e) {
        const detail = e?.response?.data?.message || e?.message || 'Unknown error';
        setMsg(`Payment succeeded, but recording the order failed: ${detail}`);
        toastError('Could not record order.');
      }
    })();
    return () => { alive = false; };
  }, [params]);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Thank you!</h1>
      <p className="mt-2 text-gray-700">{msg}</p>

      <div className="mt-6 flex gap-2 justify-center">
        <Link to="/orders/my" className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 transition">
          View My Orders
        </Link>
        <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 transition">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
