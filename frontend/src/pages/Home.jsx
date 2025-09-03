import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

// (Tight word-mark gradients, not hero lockups)
import brandLight from "../assets/branding/screentones-wordmark-light-gradient.svg";
import brandDark  from "../assets/branding/screentones-wordmark-dark-gradient.svg";

export default function Home() {
  const { isDark } = useTheme();

  useEffect(() => {
    const prev = document.title;
    document.title = "ScreenTones — Capture Your Tone.";
    return () => { document.title = prev; };
  }, []);

  return (
    <main className="relative overflow-hidden">
      {/* Subtle gradient band behind hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42vh]
                   bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(46,111,108,0.24),transparent_60%)]
                   dark:bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(46,111,108,0.18),transparent_60%)]"
      />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-5xl mx-auto text-center">
          <img
            src={isDark ? brandDark : brandLight}
            alt="ScreenTones"
            className="h-14 sm:h-16 lg:h-18 mx-auto mb-3 select-none"
            decoding="async"
            loading="eager"
          />
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text)]">
            Capture Your Tone.
          </p>

          {/* Brand underline */}
          <div className="mx-auto mt-3 h-[3px] w-28 sm:w-32 rounded-full bg-[var(--brand,#2E6F6C)]/85" />

          {/* CTA */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/gallery"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                         bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                         shadow-sm"
            >
              Browse Gallery
            </Link>
            <Link
              to="/cart"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm
                         bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                         text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
            >
              View Cart
            </Link>
          </div>
        </div>
      </section>

      {/* Simple feature strip */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto grid gap-5 sm:grid-cols-3">
          <Feature icon="bx-image"      title="Curated Collection"
                   text="Hand-picked wallpapers across nature, tech, minimal & more." />
          <Feature icon="bx-download"   title="Device-Ready"
                   text="Crisp files sized for phones, tablets, and desktops." />
          <Feature icon="bx-palette"    title="Tasteful Aesthetic"
                   text="Clean, modern looks that let your apps shine." />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/50
                    bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-5 text-left">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl
                      bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_12%,transparent)]
                      text-[var(--brand,#2E6F6C)] border border-[color-mix(in_srgb,var(--brand,#2E6F6C)_40%,black)]">
        <i className={`bx ${icon} text-xl`} aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-1 text-[var(--muted)] text-sm">{text}</p>
    </div>
  );
}
