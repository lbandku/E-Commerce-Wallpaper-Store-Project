// frontend/src/pages/CheckoutCancel.jsx
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutCancel() {
  const [params] = useSearchParams();
  const reason = params.get('reason'); // optional ?reason=...
  const note = reason ? `Reason: ${reason}` : 'You can try again anytime.';

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Payment canceled</h1>
      <p className="mt-2 text-gray-700">
        Your checkout was canceled before completion. {note}
      </p>

      <div className="mt-6 flex gap-2 justify-center">
        <Link
          to="/cart"
          className="px-3 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition"
        >
          Return to cart
        </Link>
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


