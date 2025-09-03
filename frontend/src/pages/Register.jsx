import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toastSuccess, toastError } from "../lib/toast.js";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prev = document.title;
    document.title = "Create account — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !name || !password) {
      const msg = "All fields are required";
      setError(msg);
      toastError(msg);
      return;
    }

    setBusy(true);
    try {
      const u = await register({ email, name, password });
      if (!u || !u.name) {
        toastSuccess("Registration successful");
        nav("/");
        return;
      }
      toastSuccess(`Welcome, ${u.name}`);
      nav(u.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
          Create your account
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Card */}
      <form
        onSubmit={submit}
        className="rounded-2xl border border-[var(--border,#E5E7EB)]/60
                   bg-[var(--surface,#fff)]/60 dark:bg-white/5
                   p-5 sm:p-6 shadow-sm space-y-4"
        noValidate
      >
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-[color-mix(in_srgb,#ef4444_35%,transparent)]
                       bg-[color-mix(in_srgb,#ef4444_12%,transparent)]
                       text-[var(--text)] px-3 py-2 text-sm"
          >
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--text)]">
            Email
          </label>
          <div className="mt-1">
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-[var(--text)]">
            Name
          </label>
          <div className="mt-1">
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              placeholder="Your name"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--text)]">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="reg-password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 pr-11 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 px-3 grid place-items-center
                         text-[var(--muted,#6B7280)] hover:text-[var(--text)]"
            >
              <i className={`bx ${showPw ? "bx-hide" : "bx-show"} text-xl`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2 rounded-xl font-semibold text-white
                     bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                     disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        {/* Link */}
        <div className="pt-1 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--brand,#2E6F6C)] hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
