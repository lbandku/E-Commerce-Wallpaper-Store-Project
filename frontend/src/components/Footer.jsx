import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="mt-10 border-t border-[var(--border,#E5E7EB)]
                 bg-[color-mix(in_srgb,var(--bg,#F8FAFC)_85%,transparent)]"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Top: brand + tagline */}
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)]">
            ScreenTones
          </div>
          <div className="text-sm text-[var(--muted)]">Capture Your Tone.</div>
          <div className="mx-auto mt-2 h-[3px] w-24 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
        </div>

        {/* Links */}
        <nav
          className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm"
          aria-label="Footer"
        >
          <div>
            <h3 className="font-semibold text-[var(--text)]">Shop</h3>
            <ul className="mt-2 space-y-1">
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/gallery">Gallery</Link></li>
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text)]">Account</h3>
            <ul className="mt-2 space-y-1">
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/login">Login</Link></li>
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/register">Register</Link></li>
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/account">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text)]">Company</h3>
            <ul className="mt-2 space-y-1">
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/">Home</Link></li>
              <li><a className="text-[var(--muted)] hover:text-[var(--text)]" href="mailto:hello@screentones.example">Contact</a></li>
            </ul>
          </div>

          <div className="lg:col-start-4">
            <h3 className="font-semibold text-[var(--text)]">Admin</h3>
            <ul className="mt-2 space-y-1">
              <li><Link className="text-[var(--muted)] hover:text-[var(--text)]" to="/admin-login">Admin Login</Link></li>
            </ul>
          </div>
        </nav>

        {/* Bottom line with Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <p>Handcrafted by Jax © {new Date().getFullYear()}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Terms" className="hover:text-[var(--text)]">Terms</a>
            <span aria-hidden="true">•</span>
            <a href="#" aria-label="Privacy" className="hover:text-[var(--text)]">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


