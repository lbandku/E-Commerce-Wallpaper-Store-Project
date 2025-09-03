// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import http from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toastError, toastSuccess } from "../lib/toast.js";
import { BtnPrimary } from "../components/ui/Primitives.jsx";

/** In dev, send AdminUsers traffic to  Render backend directly
 *  In prod, use relative paths to match existing setup
 */
const DEV_USERS_BASE =
  "https://e-commerce-wallpaper-store-project.onrender.com";
const u = (path) => (import.meta.env.DEV ? `${DEV_USERS_BASE}${path}` : path);

/** Endpoints to probe on Render (dev only). */
const USER_LIST_PATHS = [
  "/users",
  "/api/users",
  "/api/admin/users",
  "/api/users/list",
  "/api/admin/users/list",
  "/api/admin/list-users",
  "/api/admin/get-users",
];

/** Normalize shapes into consistent array. */
function normalizeUsers(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.users)
    ? data.users
    : Array.isArray(data?.items)
    ? data.items
    : [];
  return arr.map((u) => ({
    id: u._id || u.id,
    email: u.email || "",
    name: u.name || "",
    role: (u.role || (u.isAdmin ? "admin" : "user") || "user").toLowerCase(),
    raw: u,
  }));
}

/* UI bits: Role badge + segmented control */

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  const cls = isAdmin
    ? "bg-rose-500 text-white dark:bg-rose-400"
    : "bg-emerald-500 text-white dark:bg-emerald-400";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold shadow-sm " +
        cls
      }
    >
      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );
}

function RoleToggle({ user, adminCount, busy, onChange }) {
  const isAdmin = user.role === "admin";
  const isLastAdmin = isAdmin && adminCount <= 1;

  const base =
    "px-2.5 py-1 text-xs font-semibold transition outline-none " +
    "focus-visible:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)] " +
    "focus-visible:ring-[var(--brand,#2E6F6C)] disabled:opacity-50 disabled:cursor-not-allowed";

  const userBtn =
    (user.role === "user"
      ? "bg-emerald-600 text-white hover:bg-emerald-600"
      : "bg-[var(--surface,#fff)] text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,transparent)]") +
    " " +
    base;

  const adminBtn =
    (user.role === "admin"
      ? "bg-rose-600 text-white hover:bg-rose-600"
      : "bg-[var(--surface,#fff)] text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,transparent)]") +
    " " +
    base;

  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-[var(--border,#E5E7EB)] dark:bg-white/5">
      <button
        type="button"
        className={userBtn}
        disabled={busy || (user.role === "admin" && isLastAdmin)} // prevent demoting the last admin
        aria-pressed={user.role === "user"}
        onClick={() => onChange("user")}
      >
        User
      </button>
      <button
        type="button"
        className={adminBtn}
        disabled={busy}
        aria-pressed={user.role === "admin"}
        onClick={() => onChange("admin")}
      >
        Admin
      </button>
    </div>
  );
}

/* Page */

export default function AdminUsers() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");
  const [basePath, setBasePath] = useState(""); 

  const adminCount = useMemo(
    () => users.filter((u) => u.role === "admin").length,
    [users]
  );

  /** Probe list endpoints (dev→Render only). In prod assume existing relative path works. */
  const resolveUsersListPath = async () => {
    if (basePath) return basePath;
    if (!import.meta.env.DEV) {
      setBasePath("/users");
      return "/users";
    }
    for (const path of USER_LIST_PATHS) {
      try {
        const { data } = await http.get(u(path), { params: { limit: 1 } });
        const arr = normalizeUsers(data);
        if (Array.isArray(arr)) {
          setBasePath(path);
          return path;
        }
      } catch {
        // try next
      }
    }
    throw new Error(
      `No users endpoint responded on Render. Tried: ${USER_LIST_PATHS.join(", ")}`
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const path = await resolveUsersListPath();
      const { data } = await http.get(u(path), { params: { limit: 1000 } });
      setUsers(normalizeUsers(data));
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load users";
      setErr(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function setRole(user, nextRole) {
    if (user.role === nextRole) return;

    if (user.role === "admin" && nextRole !== "admin" && adminCount <= 1) {
      toastError("You can’t demote the last admin.");
      return;
    }

    const prevRole = user.role;
    setBusyId(user.id);
    // optimistic
    setUsers((xs) =>
      xs.map((x) => (x.id === user.id ? { ...x, role: nextRole } : x))
    );

    try {
      const listPath = basePath || (await resolveUsersListPath());
      try {
        await http.patch(u(`${listPath}/${user.id}/role`), { role: nextRole });
      } catch {
        await http.patch(u(`${listPath}/${user.id}`), { role: nextRole });
      }
      toastSuccess(
        `Set ${user.name || user.email || "user"} to ${nextRole.toUpperCase()}`
      );
    } catch (e) {
      // rollback
      setUsers((xs) =>
        xs.map((x) => (x.id === user.id ? { ...x, role: prevRole } : x))
      );
      toastError(
        e?.response?.data?.message || e.message || "Could not change role"
      );
    } finally {
      setBusyId("");
    }
  }

  async function deleteUser(user) {
    const myId = me?._id || me?.id || "";
    if (user.id && myId && user.id === myId) {
      toastError("You can’t delete your own account.");
      return;
    }
    if (user.role === "admin" && adminCount <= 1) {
      toastError("You can’t delete the last admin.");
      return;
    }

    const ok = window.confirm(
      `Delete ${user.name || user.email || "this user"}? This cannot be undone.`
    );
    if (!ok) return;

    setBusyId(user.id);
    const prev = users;
    setUsers((xs) => xs.filter((x) => x.id !== user.id));

    try {
      const listPath = basePath || (await resolveUsersListPath());
      try {
        await http.delete(u(`${listPath}/${user.id}`));
      } catch {
        await http.delete(u(`${listPath}/delete/${user.id}`));
      }
      toastSuccess("User deleted");
    } catch (e) {
      setUsers(prev);
      toastError(
        e?.response?.data?.message || e.message || "Could not delete user"
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Users</h1>
        <BtnPrimary onClick={fetchUsers} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </BtnPrimary>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-300/60 bg-red-50/70 text-red-700 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-[var(--muted)]">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="text-[var(--muted)]">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[var(--border,#E5E7EB)] rounded-lg">
            <thead className="bg-[var(--surface,#f9fafb)] dark:bg-white/10">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-[var(--muted)]">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-[var(--muted)]">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-[var(--muted)]">
                  Role
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-[var(--border,#E5E7EB)]"
                >
                  <td className="px-4 py-2 text-[var(--text)]">
                    {u.name || "—"}
                  </td>
                  <td className="px-4 py-2 text-[var(--text)]">{u.email}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                      <RoleToggle
                        user={u}
                        adminCount={adminCount}
                        busy={busyId === u.id}
                        onChange={(role) => setRole(u, role)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => deleteUser(u)}
                      disabled={busyId === u.id}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
