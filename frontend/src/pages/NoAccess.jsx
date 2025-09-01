// frontend/src/pages/NoAccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NoAccess() {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">No access</h1>
      <p className="mt-2 text-gray-700">
        You don’t have permission to view this page.
      </p>
      <div className="mt-6 flex gap-2 justify-center">
        <Link
          to="/"
          className="px-3 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}


