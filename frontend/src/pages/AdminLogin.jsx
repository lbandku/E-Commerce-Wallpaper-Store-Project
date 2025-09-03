// frontend/src/pages/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toastError, toastSuccess } from "../lib/toast.js";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login, logout } = useAuth();

  // ⬇️ Start empty (no dev autofill)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Admin Login — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);

      if (user?.role !== "admin") {
        await logout?.();
        const msg = "This account is not an admin.";
        setError(msg);
        toastError(msg);
        return;
      }

      // ⬇️ Clear form before navigating away
      setEmail("");
      setPassword("");

      toastSuccess("Admin login successful");
      nav("/admin");
    } catch {
      setError("Login failed");
      toastError("Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Admin Login
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Card */}
      <div className="max-w-sm mx-auto rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-6">
        {/* Admin-only hint */}
        <div className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2
                        bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_12%,transparent)]
                        text-[var(--brand-700,#24534f)]">
          <i className="bx bx-shield-quarter text-xl" aria-hidden="true" />
          <span className="text-sm font-medium">For administrators only</span>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-300/60 bg-red-50/70 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-[var(--text)]">
              Admin email
            </label>
            <input
              type="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)]">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 px-4 py-2 rounded-xl font-semibold text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                       disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-4">
          Not an admin?{" "}
          <Link to="/login" className="underline hover:opacity-80">
            User login
          </Link>
        </p>
      </div>
    </main>
  );
}
