import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { toastError, toastSuccess } from '../lib/toast.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await api.get('/users');
      setRows(data || []);
    } catch {
      setErr('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    try {
      const { data } = await api.patch(`/users/${id}/role`, { role });
      setRows((r) => r.map(u => u._id === id ? data : u));
      toastSuccess(`Role updated to ${role}`);
    } catch {
      toastError('Failed to update role');
    }
  };

  const delUser = async (id) => {
    if (id === user?._id) {
      toastError('You cannot delete your own admin account here.');
      return;
    }
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setRows((r) => r.filter(u => u._id !== id));
      toastSuccess('User deleted');
    } catch {
      toastError('Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Manage Users</h1>

      {loading && <div className="py-16 text-center text-gray-500">Loading users…</div>}
      {err && <div className="py-4 text-center text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="overflow-x-auto bg-white rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Email</th>
                <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                <th className="text-left p-3 font-semibold text-gray-700">Role</th>
                <th className="text-left p-3 font-semibold text-gray-700">Created</th>
                <th className="text-right p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">
                    <select
                      className="border rounded px-2 py-1 text-gray-900 bg-white"
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 bg-white hover:bg-gray-200 transition"
                      onClick={() => delUser(u._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td className="p-6 text-center text-gray-500" colSpan={5}>No users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



