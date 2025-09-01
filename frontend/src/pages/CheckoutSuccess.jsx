// frontend/src/pages/CheckoutSuccess.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toastSuccess, toastError } from '../lib/toast.js';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState('Finalizing your order…');
  const [status, setStatus] = useState('pending'); 
  // "pending" | "success" | "error"

  useEffect(() => {
    let alive = true;

    const recordOrder = async () => {
      try {
        const sessionId = params.get('session_id');
        const productId = params.get('productId');

        if (!sessionId) {
          if (alive) {
            setStatus('error');
            setMsg('Payment completed, but session_id is missing.');
          }
          return;
        }

        await api.post('/orders/confirm', { session_id: sessionId, productId });
        if (!alive) return;

        setStatus('success');
        setMsg('Your order has been saved. You can view it on the My Orders page.');
        toastSuccess('Order recorded!');
      } catch (e) {
        if (!alive) return;
        const detail = e?.response?.data?.message || e?.message || 'Unknown error';
        setStatus('error');
        setMsg(`Payment succeeded, but recording the order failed: ${detail}`);
        toastError('Could not record order.');
      }
    };

    recordOrder();
    return () => { alive = false; };
  }, [params]);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Thank you!</h1>
      <p className="mt-2 text-gray-700">{msg}</p>

      <div className="mt-6 flex gap-2 justify-center">
        {status === 'success' && (
          <Link
            to="/orders/my"
            className="px-3 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition"
          >
            View My Orders
          </Link>
        )}
        {status === 'error' && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-red-600 text-red-600 bg-white hover:bg-red-50 transition"
          >
            Try again
          </button>
        )}
        <Link
          to="/"
          className="px-3 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}


