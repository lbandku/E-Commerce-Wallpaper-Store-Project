// src/pages/CheckoutSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api.js';
import { toastError, toastSuccess } from '../lib/toast.js';
import { useCart } from '../context/CartContext.jsx';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const { clear } = useCart();
  const sessionId = params.get('session_id');

  useEffect(() => {
    let cancelled = false;
    if (!sessionId) return;

    const confirm = async () => {
      try {
        const { data } = await api.post('/api/checkout/confirm', { sessionId });
        if (!cancelled) {
          toastSuccess('Payment recorded. Thank you!');
          // Clear cart exactly once
          clear && clear();
          setDone(true);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e?.response?.data?.message || 'Order recording failed';
          toastError(msg);
        }
      }
    };

    confirm();

    return () => {
      cancelled = true;
    };
  // Only depend on sessionId, not on `clear`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-2xl font-semibold mb-3 text-gray-900">Payment Successful</h1>
      <p className="text-gray-600 mb-6">
        {done ? 'Your order was recorded and your cart has been cleared.' : 'Finalizing your order…'}
      </p>
      <Link
        to="/"
        className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Return to Gallery
      </Link>
    </div>
  );
}


