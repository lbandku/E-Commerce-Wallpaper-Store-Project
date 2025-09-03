import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const loc = useLocation();

  useEffect(() => {
    const prev = document.title;
    document.title = "Page not found — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16">
      {/* Force readable status line like Success/Cancel */}
      <style>{`
        #st-404-note { color:#000 !important; opacity:1 !important; }
        .dark #st-404-note { color:#D1D5DB !important; }
      `}</style>

      <div className="max-w-2xl mx-auto text-center">
        <div
          className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full
                     bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                     border border-[color-mix(in_srgb,var(--text,#111)_20%,transparent)]
                     shadow-sm"
          aria-hidden="true"
        >
          <i className="bx bx-ghost text-3xl text-[var(--text)] opacity-80" />
        </div>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Page not found
        </h1>

        <div id="st-404-note" className="mt-2 text-[15px] sm:text-base">
          We couldn’t find <span className="font-mono break-all">{loc.pathname}</span>.
        </div>

        <div className="mx-auto mt-3 h-[3px] w-32 sm:w-36 rounded-full bg-[var(--brand,#2E6F6C)]/85" />

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/gallery"
            className="px-4 py-2 rounded-lg font-semibold text-sm text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
          >
            Back to Gallery
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg font-semibold text-sm
                       bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                       text-[var(--text)]
                       hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
