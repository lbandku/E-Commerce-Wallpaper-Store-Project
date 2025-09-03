import React, { useEffect, useMemo, useState } from "react";
import * as apiClient from "../lib/api.js";
import { toastSuccess, toastError } from "../lib/toast.js";
import { useAuth } from "../context/AuthContext.jsx";

const http = apiClient.api || apiClient.default || apiClient;

export default function Account() {
  const auth = (typeof useAuth === "function" ? useAuth() : {}) || {};
  const currentUser = auth.user || {};
  const setUser =
    auth.setUser || auth.updateUser || auth.refreshUser || (() => {});

  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Account — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    // keep in sync if auth user changes
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
  }, [currentUser.name, currentUser.email]);

  const initials = useMemo(() => {
    const base = (currentUser.name || currentUser.email || "ST").trim();
    const parts = base.split(/\s+/);
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  }, [currentUser.name, currentUser.email]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      // alternates some APIs expect
      user: { name: name.trim(), email: email.trim() },
      profile: { name: name.trim(), email: email.trim() },
    };

    const endpoints = [
      { method: "patch", url: "/api/users/me", body: { name: payload.name, email: payload.email } },
      { method: "patch", url: "/api/account", body: { name: payload.name, email: payload.email } },
      { method: "post",  url: "/api/profile", body: { user: { name: payload.name, email: payload.email } } },
    ];

    let ok = false, lastErr = null;
    for (const ep of endpoints) {
      try {
        if (ep.method === "patch") await http.patch(ep.url, ep.body);
        else await http.post(ep.url, ep.body);
        ok = true; break;
      } catch (e) { lastErr = e; }
    }

    if (!ok) {
      const msg = lastErr?.response?.data?.message || lastErr?.message || "Could not update profile";
      toastError(msg);
      setSavingProfile(false);
      return;
    }

    toastSuccess("Profile saved");
    try { setUser({ ...currentUser, name: payload.name, email: payload.email }); } catch {}
    setSavingProfile(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toastError("Please fill both password fields");
      return;
    }
    setChangingPass(true);
    const payloads = [
      { url: "/api/auth/change-password", body: { currentPassword, newPassword } },
      { url: "/api/users/change-password", body: { currentPassword, newPassword } },
      { url: "/api/account/password", body: { password: currentPassword, newPassword } },
    ];

    let ok = false, lastErr = null;
    for (const p of payloads) {
      try { await http.post(p.url, p.body); ok = true; break; }
      catch (e) { lastErr = e; }
    }

    if (!ok) {
      const msg = lastErr?.response?.data?.message || lastErr?.message || "Password change failed";
      toastError(msg);
      setChangingPass(false);
      return;
    }

    toastSuccess("Password updated");
    setCurrentPassword("");
    setNewPassword("");
    setChangingPass(false);
  };

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Account
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Top card: Profile */}
      <section className="max-w-3xl mx-auto grid gap-4 md:grid-cols-[160px_1fr]">
        {/* Avatar / identity */}
        <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4 flex flex-col items-center justify-center">
          <div className="h-24 w-24 rounded-full grid place-items-center text-2xl font-bold
                          bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_20%,transparent)]
                          text-[var(--brand-700,#24534f)]">
            {initials.toUpperCase()}
          </div>
          <div className="mt-3 text-center">
            <div className="font-semibold text-[var(--text)]">{currentUser.name || "—"}</div>
            <div className="text-sm text-[var(--muted)]">{currentUser.email || "—"}</div>
          </div>
        </div>

        {/* Profile form */}
        <form
          onSubmit={saveProfile}
          className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-5 sm:p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[var(--text)]">Profile</h2>

          <div>
            <label className="block text-sm font-medium text-[var(--text)]">Name</label>
            <input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Used for order receipts and account notices.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 rounded-xl font-semibold text-white
                         bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                         disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Password card */}
      <section className="max-w-3xl mx-auto mt-4">
        <form
          onSubmit={changePassword}
          className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-5 sm:p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[var(--text)]">Change Password</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--text)]">Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e)=>setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                           px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                           focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                           focus:ring-[var(--brand,#2E6F6C)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)]">New password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                minLength={6}
                className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                           px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                           focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                           focus:ring-[var(--brand,#2E6F6C)]"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">At least 6 characters.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPass}
              className="px-4 py-2 rounded-xl font-semibold text-white
                         bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                         disabled:opacity-60"
            >
              {changingPass ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
