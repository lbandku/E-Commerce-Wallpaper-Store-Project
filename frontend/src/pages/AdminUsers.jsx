import React, { useEffect, useState, useCallback } from 'react';

/** Helper: get JWT from storage (adjust if key is named differently) */
function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    ''
  );
}

const API_BASE = '/api/admin/users';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Add cache-buster to always get a fresh 200
      const url = `${API_BASE}?limit=1000&_ts=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Cache-Control': 'no-cache'
        }
      });
      if (res.status === 304) {
        // 304 = Not Modified → keep existing list
        setLoading(false);
        return;
      }
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
      const res = await fetch(`${API_BASE}/${u._id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        credentials: 'include',
        body: JSON.stringify({ role: nextRole })
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.error || `Update failed: ${res.status}`);
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
