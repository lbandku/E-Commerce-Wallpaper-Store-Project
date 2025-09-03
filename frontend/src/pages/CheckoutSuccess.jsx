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

  // Tab title
  useEffect(() => {
    const prev = document.title;
    document.title = 'Payment Successful — ScreenTones';
    return () => { document.title = prev; };
  }, []);

  // Confirm session + clear cart once
  useEffect(() => {
    let cancelled = false;
    if (!sessionId) return;

    const confirm = async () => {
      try {
        await api.post('/api/checkout/confirm', { sessionId });
        if (!cancelled) {
          toastSuccess('Payment recorded. Thank you!');
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
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16">
      {/* Force the status color with !important so it trumps global rules */}
      <style>{`
        #st-success-status { color: #000 !important; opacity: 1 !important; }
        .dark #st-success-status { color: #D1D5DB !important; }
      `}</style>

      <div className="max-w-2xl mx-auto text-center">
        {/* Success emblem */}
        <div
          className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full
                     bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_12%,transparent)]
                     border border-[color-mix(in_srgb,var(--brand,#2E6F6C)_40%,black)]
                     shadow-sm"
          aria-hidden="true"
        >
          <i className="bx bx-check text-3xl !text-[var(--brand,#2E6F6C)]" />
        </div>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Payment Successful
        </h1>

        {/* Status line – black in light mode */}
        <div
          id="st-success-status"
          role="status"
          aria-live="polite"
          className="mt-2 text-[15px] sm:text-base"
        >
          {done
            ? 'Your order was recorded and your cart has been cleared.'
            : 'Finalizing your order…'}
        </div>

        {/* Brand underline */}
        <div className="mx-auto mt-3 h-[3px] w-32 sm:w-36 rounded-full bg-[var(--brand,#2E6F6C)]/85" />

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg font-semibold text-sm text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
          >
            Return to Gallery
          </Link>
          <Link
            to="/cart"
            className="px-4 py-2 rounded-lg font-semibold text-sm
                       bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                       text-[var(--text)]
                       hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
          >
            View Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
