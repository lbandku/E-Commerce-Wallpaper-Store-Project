import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { token, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();

  // shared button styles
  const btnBase = "px-3 py-2 rounded-lg text-sm font-medium transition";
  const btnDark = `${btnBase} bg-gray-900 text-white hover:bg-black`;
  const btnGhost = `${btnBase} bg-gray-200 text-gray-900 hover:bg-gray-300`;

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-gray-900">Digital Wallpaper</Link>
          {/* Mobile cart count */}
          <span className="ml-4 text-sm text-gray-700 sm:hidden">Cart: {cart.length}</span>
        </div>

        {/* Stack on mobile, row on sm+ */}
        <nav className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <Link className="text-gray-800 hover:text-gray-900" to="/">Gallery</Link>

          {token ? (
            <>
              <Link className="text-gray-800 hover:text-gray-900" to="/admin">Admin</Link>
              <button
                className={btnGhost}
                onClick={() => { logout(); nav('/'); }}
                aria-label="Log out"
              >
                Logout
              </button>
            </>
          ) : (
            <Link className={btnDark} to="/login" aria-label="Log in">
              Login
            </Link>
          )}

          {/* Cart as a real interactive element for consistency */}
          <Link
            to="/cart"                 // TODO: create /cart later; safe to leave for now
            className={btnDark}
            aria-label={`Cart with ${cart.length} item${cart.length === 1 ? '' : 's'}`}
          >
            Cart: {cart.length}
          </Link>
        </nav>
      </div>
    </header>
  );
}
