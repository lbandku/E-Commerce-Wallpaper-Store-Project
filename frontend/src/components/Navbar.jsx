import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

import brandLight from '../assets/branding/screentones-nav-lockup-light.svg';
import brandDark  from '../assets/branding/screentones-nav-lockup-dark.svg';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();
  const { isDark, toggle } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const cartCount = cart?.length ?? 0;

  const headerClass =
    "sticky top-0 z-10 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-80 " +
    "bg-[color-mix(in_srgb,var(--bg,#F8FAFC)_85%,transparent)] border-[var(--border,#E5E7EB)]";

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-semibold transition-colors outline-none " +
    "!text-[var(--brand,#2E6F6C)] visited:!text-[var(--brand,#2E6F6C)] " +
    "hover:!text-[var(--brand-600,#2F6657)] hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,transparent)] " +
    "focus-visible:ring-2 ring-offset-2 ring-offset-[var(--surface,#fff)] focus-visible:ring-[var(--brand,#2E6F6C)]";

  const cartLinkCls = linkBase + " inline-flex items-center gap-2";
  const cartBadgeCls =
    "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-extrabold text-white " +
    "bg-[var(--brand,#2E6F6C)] border border-[color-mix(in_srgb,var(--brand,#2E6F6C)_30%,#000)]";

  const iconBtnNeutral =
    "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors " +
    "text-[var(--text,#1A1A1A)] hover:bg-[color-mix(in_srgb,var(--text,#1A1A1A)_10%,var(--bg,#F8FAFC))]";

  const iconBtn = isDark
    ? "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors " +
      "text-[var(--text,#F3F4F6)] bg-[color-mix(in_srgb,var(--text,#F3F4F6)_12%,var(--bg,#0E1111))] " +
      "hover:bg-[color-mix(in_srgb,var(--text,#F3F4F6)_22%,var(--bg,#0E1111))]"
    : "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors " +
      "text-[var(--brand,#2E6F6C)] bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,var(--bg,#F8FAFC))] " +
      "hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_16%,var(--bg,#F8FAFC))]";

  // Dedicated style for hamburger (readable in light mode)
  const hamburgerBtn = isDark
    ? "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors " +
      "text-white bg-[color-mix(in_srgb,var(--text,#F3F4F6)_22%,#0E1111)] " +
      "hover:bg-[color-mix(in_srgb,var(--text,#F3F4F6)_32%,#0E1111)]"
    : "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors " +
      "text-white bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]";

  const ThemeIcon = useMemo(() => {
    const spin = spinning ? " spin-once" : "";
    if (isDark) {
      return (
        <i
          className={`bx bx-sun text-xl${spin}`}
          style={{ color: "#FBBF24" }}
          aria-hidden="true"
        />
      );
    }
    return (
      <i
        className={`bx bx-moon text-xl !text-[var(--brand,#2E6F6C)]${spin}`}
        aria-hidden="true"
      />
    );
  }, [isDark, spinning]);

  const handleToggleTheme = () => {
    setSpinning(true);
    toggle();
    setTimeout(() => setSpinning(false), 360);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={headerClass}>
      <div className="mx-auto w-full max-w-7xl px-4 py-4">
        <div className="grid grid-cols-3 items-center sm:[grid-template-columns:auto_1fr_auto]">
          {/* Hamburger (mobile) */}
          <div className="flex items-center">
            <button
              type="button"
              className={`sm:hidden mr-2 ${hamburgerBtn}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileOpen(v => !v)}
            >
              <i className={`bx ${mobileOpen ? 'bx-x' : 'bx-menu'} text-2xl`} aria-hidden="true" />
            </button>
          </div>

          {/* Brand */}
          <Link
            to="/"
            className="col-start-2 sm:col-start-1 justify-self-center sm:justify-self-start inline-flex items-center"
            onClick={closeMobile}
            aria-label="ScreenTones home"
          >
            <img
              src={isDark ? brandDark : brandLight}
              alt="ScreenTones"
              className="block h-10 sm:h-12 lg:h-14 w-auto"
              decoding="async"
              loading="eager"
            />
            <span className="sr-only">ScreenTones</span>
          </Link>

          {/* Theme toggle + cart summary */}
          <div className="justify-self-end flex items-center gap-2">
            <span className="ml-1 text-sm text-[var(--muted,#6B7280)] sm:hidden">Cart: {cartCount}</span>
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className={iconBtn}
            >
              {ThemeIcon}
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav
          id="mobile-nav"
          className={(mobileOpen ? "block" : "hidden") +
            " mt-3 sm:mt-0 sm:flex sm:flex-row sm:items-center sm:justify-end sm:gap-2"}
        >
          <Link to="/gallery" className={linkBase} onClick={closeMobile}>Gallery</Link>

          {user?.role === "admin" ? (
            <Link to="/admin" className={linkBase} onClick={closeMobile}>Admin</Link>
          ) : (
            <Link to="/admin-login" className={linkBase} onClick={closeMobile}>Admin</Link>
          )}

          {token && user?.role !== "admin" && (
            <Link to="/orders/my" className={linkBase} onClick={closeMobile}>
              My Orders
            </Link>
          )}

          {!token ? (
            <>
              <Link to="/register" className={linkBase} onClick={closeMobile}>Register</Link>
              <Link to="/login" className={linkBase} onClick={closeMobile}>Login</Link>
            </>
          ) : (
            <span
              role="button"
              tabIndex={0}
              className={linkBase}
              onClick={() => { logout(); nav("/"); closeMobile(); }}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (logout(), nav("/"), closeMobile())}
            >
              Logout
            </span>
          )}

          <Link
            to="/cart"
            onClick={closeMobile}
            className={cartLinkCls}
            aria-label={`Cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className={cartBadgeCls} aria-hidden="true">{cartCount}</span>}
            <span className="sr-only">Cart items: {cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
