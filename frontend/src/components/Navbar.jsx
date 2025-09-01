// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();

  // unified text-link style
  const navLink =
    "cursor-pointer px-3 py-2 rounded-lg text-sm font-medium no-underline " +
    "text-gray-800 hover:text-gray-900 focus:outline-none hover:bg-gray-200 " +
    "transition flex items-center gap-2";

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-gray-900 no-underline">
            Wallpaper
          </Link>
          {/* Mobile-only quick cart count */}
          <span className="ml-4 text-sm text-gray-700 sm:hidden">
            Cart: {cart?.length ?? 0}
          </span>
        </div>

        {/* Stack on mobile; right-align on sm+ */}
        <nav className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:gap-4">

          {/* 1) Gallery */}
          <Link to="/" className={navLink}>Gallery</Link>

          {/* 2) Admin slot: Admin (if admin) or Admin Login (otherwise) */}
          {user?.role === 'admin' ? (
            <Link to="/admin" className={navLink}>Admin</Link>
          ) : (
            <Link to="/admin-login" className={navLink}>Admin</Link>
          )}

          {/* 3) Register (only when logged out) / Logout (when logged in) / Login (only when logged out) */}
          {!token ? (
            <>
              {/* 3) Register */}
              <Link to="/register" className={navLink} aria-label="Register">
                Register
              </Link>
              {/* 4) Login */}
              <Link to="/login" className={navLink} aria-label="User login">
                Login
              </Link>
            </>
          ) : (
            <span
              onClick={() => { logout(); nav('/'); }}
              aria-label="Log out"
              className={navLink}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { logout(); nav('/'); }
              }}
            >
              Logout
            </span>
          )}

          {/* 5) Cart */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 transition"
            aria-label={`Cart with ${(cart?.length ?? 0)} item${(cart?.length ?? 0) === 1 ? '' : 's'}`}
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

            {(cart?.length ?? 0) > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full
                           border border-gray-400 bg-white px-1.5 text-xs leading-none text-gray-900"
                aria-hidden="true"
              >
                {cart.length}
              </span>
            )}
            <span className="sr-only">Cart items: {cart?.length ?? 0}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
