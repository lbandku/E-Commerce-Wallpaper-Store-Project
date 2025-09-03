import React, { useEffect, useState, useCallback } from 'react';

/** Read API base from env; works whether it ends with /api or not */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
function normalizeBase(base) { return base.replace(/\/+$/, ''); }
function join(base, path) { return `${normalizeBase(base)}/${path.replace(/^\/+/, '')}`; }
const USERS_PATH = /\/api\/?$/.test(RAW_BASE) ? 'admin/users' : 'api/admin/users';
const USERS_BASE_URL = join(RAW_BASE, USERS_PATH);

/** Get JWT (adjust keys if your app uses a different one) */
function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('token') ||
    ''
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const url = `${USERS_BASE_URL}?limit=1000&_ts=${Date.now()}`;
      const token = getToken();
      if (!token) {
        setLoading(false);
        setError('Please log in as an admin to view users.');
        return;
      }
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          Accept: 'application/json'
        }
        // credentials omitted (we use Bearer token header)
      });

      if (res.status === 304) { setLoading(false); return; }
      if (res.status === 401) throw new Error('Unauthorized. Please log in again.');
      if (res.status === 403) throw new Error('Forbidden. Admin access required.');
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleRole(u) {
    const isAdmin = u.role === 'admin' || u.isAdmin === true;
    const nextRole = isAdmin ? 'user' : 'admin';
    setBusy(prev => ({ ...prev, [u._id]: true }));
    setError('');
    try {
      const token = getToken();
      if (!token) throw new Error('Unauthorized. Please log in again.');
      const res = await fetch(join(USERS_BASE_URL, `${u._id}/role`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.status === 401) throw new Error('Unauthorized. Please log in again.');
      if (res.status === 403) throw new Error('Forbidden. Admin access required.');
      if (!res.ok) {
        let msg = `Update failed: ${res.status}`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      await fetchUsers();
    } catch (e) {
      setError(e.message || 'Failed to update role.');
    } finally {
      setBusy(prev => ({ ...prev, [u._id]: false }));
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading users…</div>;
  if (error) {
    return (
      <div style={{ padding: 16, color: 'crimson' }}>
        {error}
        <button style={{ marginLeft: 12 }} onClick={fetchUsers}>Retry</button>
      </div>
    );
  }
  if (!users.length) return <div style={{ padding: 16 }}>No users found.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Users</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px 6px' }}>Name</th>
            <th style={{ padding: '8px 6px' }}>Email</th>
            <th style={{ padding: '8px 6px' }}>Role</th>
            <th style={{ padding: '8px 6px' }}></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const isAdmin = u.role === 'admin' || u.isAdmin === true;
            return (
              <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 6px' }}>{u.name || '—'}</td>
                <td style={{ padding: '8px 6px' }}>{u.email}</td>
                <td style={{ padding: '8px 6px' }}>{isAdmin ? 'admin' : 'user'}</td>
                <td style={{ padding: '8px 6px' }}>
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={!!busy[u._id]}
                    aria-busy={!!busy[u._id]}
                    style={{ padding: '6px 10px', borderRadius: 6 }}
                  >
                    {busy[u._id] ? 'Saving…' : (isAdmin ? 'Make user' : 'Make admin')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

