import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Admin Dashboard
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Manage Products */}
        <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Manage Products</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Add new wallpapers and manage inventory (search & delete).
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              to="/admin/products"
              className="px-3 py-2 rounded-xl font-semibold text-white
                         bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
            >
              Open
            </Link>
            <Link
              to="/admin/add-product"
              className="px-3 py-2 rounded-xl font-semibold
                         bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                         text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
            >
              Full Add Form
            </Link>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Orders</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Review customer orders and their fulfillment status.
          </p>
          <Link
            to="/admin/orders"
            className="inline-block mt-3 px-3 py-2 rounded-xl font-semibold text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
          >
            Go to Orders
          </Link>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Users</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            View customers and manage admin access.
          </p>
          <Link
            to="/admin/users"
            className="inline-block mt-3 px-3 py-2 rounded-xl font-semibold text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
          >
            Go to Users
          </Link>
        </div>
      </div>
    </div>
  );
}
