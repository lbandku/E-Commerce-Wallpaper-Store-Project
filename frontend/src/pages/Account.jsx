import React from 'react';
import { api } from '../lib/api.js';
import { toastError, toastSuccess } from '../lib/toast.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const del = async () => {
    if (!confirm('This will permanently delete your account. Continue?')) return;
    try {
      await api.delete('/auth/me');
      toastSuccess('Account deleted');
      logout();
      nav('/');
    } catch {
      toastError('Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">My Account</h1>
      {user ? (
        <>
          <div className="space-y-1 text-gray-800">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>

          <div className="mt-6">
            <button
              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 transition"
              onClick={del}
            >
              Delete my account
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600">You’re not logged in.</p>
      )}
    </div>
  );
}

