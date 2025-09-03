import React, { useEffect, useState, useCallback } from 'react';

/** Read your API base from env. This handles both:
 * - VITE_API_BASE_URL = https://api.onrender.com/api
 * - VITE_API_BASE_URL = https://api.onrender.com
 */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
function normalizeBase(base) {
  // remove trailing slashes
  const trimmed = base.replace(/\/+$/, '');
  return trimmed;
}
function apiJoin(base, path) {
  const b = normalizeBase(base);
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}
// If base ends with /api, we just append 'admin/users'.
// If it doesn't, we append 'api/admin/users'.
const USERS_PATH = /\/api\/?$/.test(RAW_BASE) ? 'admin/users' : 'api/admin/users';
const USERS_BASE_URL = apiJoin(RAW_BASE, USERS_PATH);

/** Helper: get JWT from storage (adjust key name if different) */
function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
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
      // Cache-bust and force no-store so we get a fresh JSON body
      const url = `${USERS_BASE_URL}?limit=1000&_ts=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Cache-Control': 'no-cache',
          Accept: 'application/json'
        }
      });

      // If the server ever sends 304, don't treat it as an error
      if (res.status === 304) {
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // If HTML came back (e.g., wrong host), this will throw below
        const text = await res.text();
        try {
          const maybeJson = JSON.parse(text);
          throw new Error(maybeJson?.error || `Fetch failed: ${res.status}`);
        } catch {
          // Not JSON — likely HTML => show a helpful hint
          throw new Error(
            `Expected JSON but got HTML. Check VITE_API_BASE_URL on the frontend Render service points to your API. Response status: ${res.status}`
          );
        }
      }

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
      const res = await fetch(apiJoin(USERS_BASE_URL, `${u._id}/role`), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ role: nextRole })
      });

      if (!res.ok) {
        let msg = `Update failed: ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {/* ignore */}
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
        <button style={{ marginLeft: 12 }} onClick={fetchUsers}>
          Retry
        </button>
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
