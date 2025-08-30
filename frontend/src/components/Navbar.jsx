import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { token, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();

  // Plain nav item (works for <a> and <span>)
  const navItem = "cursor-pointer px-3 py-2 text-sm font-medium";

  // Cart = outlined button
  const cartBtn =
    "px-3 py-2 rounded-lg text-sm font-medium border border-gray-400 text-gray-900 hover:bg-gray-200 transition";

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-gray-900">
            Wallpaper
          </Link>
          {/* Mobile cart count only (text) */}
          <span className="ml-4 text-sm text-gray-700 sm:hidden">
            Cart: {cart.length}
          </span>
        </div>

        {/* Stack on mobile; force identical link colors inside nav */}
        <nav
          className={[
            "mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:gap-4",
            // descendant utilities to normalize anchors:
            "[&_a]:no-underline [&_a]:text-gray-800 [&_a:hover]:text-gray-900 [&_a:visited]:text-gray-800",
          ].join(" ")}
        >
          <Link to="/" className={`${navItem}`}>
            Gallery
          </Link>

          {token ? (
            <>
              <Link to="/admin" className={navItem}>
                Admin
              </Link>
              {/* Logout as text (span) */}
              <span
                onClick={() => { logout(); nav('/'); }}
                aria-label="Log out"
                className={`${navItem} text-gray-800 hover:text-gray-900`}
              >
                Logout
              </span>
            </>
          ) : (
            <Link to="/login" className={navItem} aria-label="Log in">
              Login
            </Link>
          )}

          {/* Cart = only button-style item */}
          <Link
            to="/cart"
            className={cartBtn}
            aria-label={`Cart with ${cart.length} item${cart.length === 1 ? '' : 's'}`}
          >
            Cart: {cart.length}
          </Link>
        </nav>
      </div>
    </header>
  );
}
