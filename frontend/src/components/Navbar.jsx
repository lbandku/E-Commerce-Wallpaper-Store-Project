// frontend/src/components/Navbar.jsx
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();
  const { isDark, toggle } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const cartCount = cart?.length ?? 0;

  // Header styles (bg + border only; no text colors here to avoid icon inheritance issues)
  const headerClass =
    "sticky top-0 z-10 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-80 " +
    (isDark ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200");

  const brandClass = "font-bold text-lg no-underline " + (isDark ? "text-white" : "text-gray-900");

  const navLink =
    "cursor-pointer px-3 py-2 rounded-lg text-sm font-medium no-underline transition flex items-center gap-2 " +
    (isDark
      ? "text-gray-100 hover:text-white hover:bg-gray-800"
      : "text-gray-800 hover:text-gray-900 hover:bg-gray-200");

  const cartLinkClass =
    "relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition " +
    (isDark ? "text-gray-100 hover:bg-gray-800" : "text-gray-800 hover:bg-gray-200");

  const cartBadgeClass =
    "absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs leading-none " +
    (isDark ? "border border-gray-700 bg-gray-900 text-gray-100" : "border border-gray-400 bg-white text-gray-900");

  const topRightWrap = "justify-self-end flex items-center gap-2";

  // Theme icon with explicit colors per mode + one-time spin
  const ThemeIcon = useMemo(() => {
    const spinCls = spinning ? " spin-once" : "";
    if (isDark) {
      // Dark mode → show Sun (yellow)
      return <i className={`bx bx-sun text-xl text-yellow-400${spinCls}`} aria-hidden="true" />;
    }
    // Light mode → show Moon (dark)
    return <i className={`bx bx-moon text-xl text-gray-900${spinCls}`} aria-hidden="true" />;
  }, [isDark, spinning]);

  const handleToggleTheme = () => {
    setSpinning(true);
    toggle();
    setTimeout(() => setSpinning(false), 360);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={headerClass}>
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        {/* Top row: hamburger (left on mobile), brand center (mobile)/left (sm+), toggle right */}
        <div className="grid grid-cols-3 items-center">
          {/* Left: Hamburger (mobile only) */}
          <div className="flex items-center">
<button
  type="button"
  className={`sm:hidden mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg transition
    ${isDark ? '!bg-gray-800 hover:!bg-gray-700' : '!bg-gray-200 hover:!bg-gray-300'}`}
  aria-expanded={mobileOpen}
  aria-controls="mobile-nav"
  aria-label="Toggle navigation menu"
  onClick={() => setMobileOpen(v => !v)}
>
  <i
    className={`bx ${mobileOpen ? 'bx-x' : 'bx-menu'} text-2xl ${isDark ? '!text-gray-100' : '!text-gray-900'}`}
    aria-hidden="true"
  />
</button>
          </div>

          {/* Center: Brand */}
          <Link
            to="/"
            className={`justify-self-center sm:justify-self-start ${brandClass}`}
            onClick={closeMobile}
          >
            Wallpaper
          </Link>

          {/* Right: Theme toggle + mobile cart count */}
          <div className={topRightWrap}>
            <span className={`ml-1 text-sm ${isDark ? "text-gray-300" : "text-gray-700"} sm:hidden`}>
              Cart: {cartCount}
            </span>
<button
  type="button"
  onClick={handleToggleTheme}
  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition
    ${isDark ? '!bg-gray-800 hover:!bg-gray-700' : '!bg-gray-200 hover:!bg-gray-300'}`}
>
  {/* Force icon color too (keep your spinning logic) */}
  {isDark
    ? <i className="bx bx-sun text-xl !text-yellow-400 spin-once" aria-hidden="true" />
    : <i className="bx bx-moon text-xl !text-gray-900 spin-once" aria-hidden="true" />
  }
</button>
          </div>
        </div>

        {/* Nav links */}
        <nav
          id="mobile-nav"
          className={
            (mobileOpen ? "block" : "hidden") +
            " mt-3 flex-col gap-2 sm:mt-0 sm:flex sm:flex-row sm:items-center sm:justify-end sm:gap-4"
          }
        >
          <Link to="/" className={navLink} onClick={closeMobile}>Gallery</Link>

          {user?.role === "admin" ? (
            <Link to="/admin" className={navLink} onClick={closeMobile}>Admin</Link>
          ) : (
            <Link to="/admin-login" className={navLink} onClick={closeMobile}>Admin</Link>
          )}

          {!token ? (
            <>
              <Link to="/register" className={navLink} onClick={closeMobile}>Register</Link>
              <Link to="/login" className={navLink} onClick={closeMobile}>Login</Link>
            </>
          ) : (
            <span
              onClick={() => { logout(); nav("/"); closeMobile(); }}
              className={navLink}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (logout(), nav("/"), closeMobile())}
            >
              Logout
            </span>
          )}

          <Link
            to="/cart"
            onClick={closeMobile}
            className={cartLinkClass}
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

            {cartCount > 0 && (
              <span className={cartBadgeClass} aria-hidden="true">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Cart items: {cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

