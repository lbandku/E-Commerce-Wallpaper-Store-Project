import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { token, user, logout } = useAuth(); // ← add `user`
  const { cart } = useCart();
  const nav = useNavigate();

  // Text link style
  const navLink =
    "cursor-pointer px-3 py-2 rounded-lg text-sm font-medium no-underline text-gray-800 hover:text-gray-900 focus:outline-none hover:bg-gray-200 transition flex items-center gap-2";

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-gray-900 no-underline">
            Wallpaper
          </Link>
          {/* Mobile cart count text only */}
          <span className="ml-4 text-sm text-gray-700 sm:hidden">
            Cart: {cart.length}
          </span>
        </div>

        {/* Stack on mobile; align right on sm+ */}
        <nav className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <Link to="/" className={navLink}>Gallery</Link>

          {/* Admin link only for admins */}
          {token && user?.role === 'admin' && (
            <Link to="/admin" className={navLink}>Admin</Link>
          )}

          {/* Just added, needs test: Show Orders (user history) and Account when logged in */}
          {token && (
          <>
            <Link to="/orders/my" className={navLink}>Orders</Link>
            <Link to="/account" className={navLink}>Account</Link>
          </>
          )}

          {/* Auth area */}
          {token ? (
            <span
              onClick={() => { logout(); nav('/'); }}
              aria-label="Log out"
              className={navLink}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { logout(); nav('/'); } }}
            >
              Logout
            </span>
          ) : (
            <>
              <Link to="/login" className={navLink} aria-label="Log in">
                Login
              </Link>
              <Link to="/register" className={navLink} aria-label="Register">
                Register
              </Link>
            </>
          )}

          {/* Cart: outlined-ish button with icon + count */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 transition"
            aria-label={`Cart with ${cart.length} item${cart.length === 1 ? '' : 's'}`}
          >
            {/* inline cart icon */}
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

            {/* badge (hidden when 0) */}
            {cart.length > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full
                           border border-gray-400 bg-white px-1.5 text-xs leading-none text-gray-900"
                aria-hidden="true"
              >
                {cart.length}
              </span>
            )}
            <span className="sr-only">Cart items: {cart.length}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
