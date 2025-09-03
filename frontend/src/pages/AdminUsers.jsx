import React, { useEffect, useMemo, useState } from "react";
import * as apiClient from "../lib/api.js";
import { toastSuccess, toastError } from "../lib/toast.js";
import { useAuth } from "../context/AuthContext.jsx";

const http = apiClient.api || apiClient.default || apiClient;

// Endpoints (likely endpoints across projects)
const GET_ENDPOINTS = ["/api/admin/users", "/api/users", "/api/admin/users/list"];

function normalizeUsers(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data?.items)
    ? data.items
    : [];

  return arr.map((u) => {
    const id = u._id || u.id || u.userId || u.uuid || u.email || String(Math.random());
    const name = u.name || u.fullName || u.username || "";
    const email = u.email || u.mail || "";
    const role = (u.role || u.type || (u.isAdmin ? "admin" : "user") || "user").toLowerCase();
    const createdAt = u.createdAt || u.created_at || u.joinedAt || null;
    const status = (u.status || u.state || "active").toLowerCase();
    return { id, name, email, role, createdAt, status, raw: u };
  });
}

export default function AdminUsers() {
  const auth = (typeof useAuth === "function" ? useAuth() : {}) || {};
  const currentUser = auth.user || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const prev = document.title;
    document.title = "Users — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      for (const url of GET_ENDPOINTS) {
        try {
          const { data } = await http.get(url, { params: { limit: 1000 } });
          setUsers(normalizeUsers(data));
          setLoading(false);
          return;
        } catch {
          // try next one
        }
      }
      throw new Error("No users endpoint responded");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load users";
      setErr(msg);
      toastError(msg);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role].filter(Boolean).some((s) => s.toLowerCase().includes(needle))
    );
  }, [users, q]);

  const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);

  async function setRole(user, nextRole) {
    if (user.role === nextRole) return;

    if (user.role === "admin" && nextRole !== "admin" && adminCount <= 1) {
      toastError("You can’t demote the last admin.");
      return;
    }

    const isSelf =
      (currentUser?._id && currentUser._id === user.id) ||
      (currentUser?.id && currentUser.id === user.id) ||
      (currentUser?.email && currentUser.email === user.email);

    if (isSelf && nextRole !== "admin") {
      const ok = confirm("You’re about to remove your own admin access. Continue?");
      if (!ok) return;
    }

    const prevRole = user.role;
    setBusyId(user.id);
    setUsers((xs) => xs.map((x) => (x.id === user.id ? { ...x, role: nextRole } : x)));

    try {
      let ok = false;
      let lastErr = null;

      const attempts = [
        { method: "patch", url: `/api/admin/users/${user.id}`, body: { role: nextRole } },
        { method: "patch", url: `/api/users/${user.id}`, body: { role: nextRole } },
        { method: "post", url: "/api/admin/users/role", body: { userId: user.id, role: nextRole } },
        { method: "post", url: "/api/admin/users/updateRole", body: { userId: user.id, role: nextRole } },
        ...(nextRole === "admin"
          ? [{ method: "post", url: "/api/admin/make-admin", body: { userId: user.id } }]
          : [{ method: "post", url: "/api/admin/remove-admin", body: { userId: user.id } }]),
      ];

      for (const t of attempts) {
        try {
          if (t.method === "patch") await http.patch(t.url, t.body);
          else await http.post(t.url, t.body);
          ok = true;
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!ok) {
        const msg = lastErr?.response?.data?.message || lastErr?.message || "Role update failed";
        throw new Error(msg);
      }

      toastSuccess(`Set ${user.name || user.email} to ${nextRole}`);
    } catch (e) {
      setUsers((xs) => xs.map((x) => (x.id === user.id ? { ...x, role: prevRole } : x)));
      toastError(e.message || "Could not change role");
    } finally {
      setBusyId("");
    }
  }

  async function deleteUser(user) {
    const isSelf =
      (currentUser?._id && currentUser._id === user.id) ||
      (currentUser?.id && currentUser.id === user.id) ||
      (currentUser?.email && currentUser.email === user.email);

    if (isSelf) {
      toastError("You can’t delete your own account here.");
      return;
    }
    if (user.role === "admin" && adminCount <= 1) {
      toastError("You can’t delete the last admin.");
      return;
    }
    const ok = confirm(`Delete ${user.name || user.email}? This cannot be undone.`);
    if (!ok) return;

    const prev = users;
    setBusyId(user.id);
    setUsers((xs) => xs.filter((x) => x.id !== user.id));

    try {
      let success = false;
      let lastErr = null;

      const attempts = [
        () => http.delete(`/api/admin/users/${user.id}`),
        () => http.delete(`/api/users/${user.id}`),
        () => http.delete(`/api/admin/users`, { data: { userId: user.id } }),
        () => http.post(`/api/admin/users/delete`, { userId: user.id }),
        () => http.post(`/api/admin/delete-user`, { userId: user.id }),
      ];

      for (const fn of attempts) {
        try {
          await fn();
          success = true;
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!success) {
        const msg = lastErr?.response?.data?.message || lastErr?.message || "Delete failed";
        throw new Error(msg);
      }

      toastSuccess(`Deleted ${user.name || user.email}`);
    } catch (e) {
      setUsers(prev);
      toastError(e.message || "Could not delete user");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Users
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-80">
          <label className="block text-xs sm:text-sm text-[var(--muted)]">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, role…"
            className="w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                       px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                       focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                       focus:ring-[var(--brand,#2E6F6C)]"
          />
        </div>

        {/* REFRESH button - changed to white font for visibility */}
        <button
          type="button"
          onClick={fetchUsers}
          className="px-3 py-2 rounded-xl font-semibold
                     text-white
                     bg-[var(--brand,#2E6F6C)]
                     hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_85%,#000)]
                     focus-visible:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                     focus-visible:ring-[var(--brand,#2E6F6C)]"
        >
          Refresh
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-white/40 dark:bg-white/10 animate-pulse" />
          ))}
        </div>
      )}
      {!loading && err && (
        <div className="rounded-xl border border-[color-mix(in_srgb,#ef4444_35%,transparent)] bg-[color-mix(in_srgb,#ef4444_12%,transparent)] text-[var(--text)] p-4 text-center">
          {err}
        </div>
      )}

      {/* Table */}
      {!loading && !err && (
        filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-8 text-center text-[var(--muted)]">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border,#E5E7EB)]/60">
            <table className="min-w-full text-sm">
              <thead className="bg-[color-mix(in_srgb,#000_6%,var(--surface,#fff))] text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold text-[var(--text)]">Name</th>
                  <th className="py-3 px-4 font-semibold text-[var(--text)]">Email</th>
                  <th className="py-3 px-4 font-semibold text-[var(--text)]">Role</th>
                  <th className="py-3 px-4 font-semibold text-[var(--text)]">Joined</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border,#E5E7EB)]/60">
                {filtered.map((u) => (
                  <tr key={u.id} className="bg-[var(--surface,#fff)]/60 dark:bg-white/5">
                    <td className="py-3 px-4 text-[var(--text)] font-semibold">
                      {u.name || "—"}
                      {u.status && (
                        <span
                          className={
                            "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                            (u.status === "active"
                              ? "bg-[color-mix(in_srgb,#10B981_18%,transparent)] text-[#047857]"
                              : "bg-[color-mix(in_srgb,#6B7280_18%,transparent)] text-[#374151]")
                          }
                        >
                          {u.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--text)]">{u.email}</td>
                    <td className="py-3 px-4">
                      {/* ROLE PILL button: Admin coral, User green */}
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-2 " +
                          (u.role === "admin"
                            ? "bg-[color-mix(in_srgb,#F43F5E_22%,transparent)] text-[#9F1239]" // coral
                            : "bg-[color-mix(in_srgb,#10B981_22%,transparent)] text-[#065F46]")   // green
                        }
                      >
                        {u.role}
                      </span>

                      {/* Role selector */}
                      <select
                        value={u.role}
                        disabled={busyId === u.id}
                        onChange={(e) => setRole(u, e.target.value)}
                        className="rounded-lg border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                                   px-2 py-1 text-[var(--text)]"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-[var(--text)]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => deleteUser(u)}
                        className="px-3 py-2 rounded-xl font-semibold text-white
                                   bg-red-600 hover:bg-red-700 disabled:opacity-60"
                      >
                        {busyId === u.id ? "Removing…" : "Delete Account"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </main>
  );
}
