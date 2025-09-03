import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NoAccess() {
  useEffect(() => {
    const prev = document.title;
    document.title = "No Access — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          No access
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-6 text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full grid place-items-center
                        bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_18%,transparent)]">
          <i className="bx bx-lock-alt text-2xl text-[var(--brand,#2E6F6C)]" aria-hidden="true" />
        </div>

        <p className="text-[var(--text)] font-semibold">You don’t have permission to view this page.</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          If you believe this is a mistake, try signing in with a different account or contact an admin.
        </p>

        <div className="mt-6 flex gap-2 justify-center">
          {/* Make pill button readable in dark mode */}
          <Link
            to="/"
            className="px-4 py-2 rounded-xl font-semibold
                       border border-[var(--brand,#2E6F6C)]
                       bg-[var(--surface,#fff)]
                       text-[#111] dark:text-[#111]
                       hover:bg-[color-mix(in_srgb,#000_6%,var(--surface,#fff))]"
          >
            Back to Home
          </Link>

          <Link
            to="/gallery"
            className="px-4 py-2 rounded-xl font-semibold
                       bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                       text-[var(--text)]
                       hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
          >
            Browse Gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
