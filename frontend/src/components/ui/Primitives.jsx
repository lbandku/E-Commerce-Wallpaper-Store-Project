// frontend/src/components/ui/Primitives.jsx
import React from "react";

/** Utility to merge class strings */
export const cn = (...xs) => xs.filter(Boolean).join(" ");

/* ---------------- Buttons (with lighter text for secondary/ghost) ---------------- */
const btnBase =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-lg,20px)] text-sm font-semibold transition active:translate-y-px focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-[var(--surface,#fff)] focus-visible:ring-[var(--brand,#2E6F6C)]";

export function BtnPrimary({ className = "", ...props }) {
  return (
    <button
      className={cn(
        btnBase,
        "text-white bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)] shadow-sm hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

export function BtnSecondary({ className = "", ...props }) {
  return (
    <button
      className={cn(
        btnBase,
        "text-[var(--muted,#6B7280)] bg-[var(--surface,#fff)] border border-[var(--border,#E5E7EB)] hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_6%,var(--surface,#fff))]",
        className
      )}
      {...props}
    />
  );
}

export function BtnGhost({ className = "", ...props }) {
  return (
    <button
      className={cn(
        btnBase,
        "text-[var(--muted,#6B7280)] bg-transparent hover:bg-[color-mix(in_srgb,var(--bg,#F8FAFC)_90%,#000)]",
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Inputs / Selects ---------------- */
const fieldBase =
  "block w-full rounded-[var(--radius-lg,20px)] border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)] " +
  "text-[var(--text,#1A1A1A)] placeholder:text-[color-mix(in_srgb,var(--text,#1A1A1A)_50%,transparent)] " +
  "px-3.5 py-2.5 outline-none transition focus-visible:ring-2 ring-offset-2 ring-offset-[var(--bg,#F8FAFC)] focus-visible:ring-[var(--brand,#2E6F6C)]";

export function Input({ icon, className = "", ...props }) {
  // `icon` optional: pass a Boxicons class, e.g. "bx-search"
  return (
    <div className="relative">
      {icon && (
        <i
          className={`bx ${icon} pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted,#6B7280)]`}
        />
      )}
      <input
        className={cn(fieldBase, icon ? "pl-10" : "", className)}
        {...props}
      />
    </div>
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(fieldBase, "appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted,#6B7280)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={cn(fieldBase, "min-h-[120px]")} {...props} />;
}

/* ---------------- Cards / Surfaces ---------------- */
export function Card({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg,20px)] bg-[var(--surface,#fff)] border border-[var(--border,#E5E7EB)] shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className = "", ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

/* ---------------- Badges / Chips ---------------- */
export function Badge({ variant = "brand", className = "", ...props }) {
  const variants = {
    brand: "bg-[var(--brand,#2E6F6C)] text-white",
    outline:
      "text-[var(--brand,#2E6F6C)] bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,transparent)] border border-[color-mix(in_srgb,var(--brand,#2E6F6C)_35%,transparent)]",
    success: "bg-[var(--success,#16A34A)] text-white",
    danger: "bg-[var(--danger,#DC2626)] text-white",
    neutral:
      "text-[var(--muted,#6B7280)] bg-[color-mix(in_srgb,#000_5%,var(--bg,#F8FAFC))] border border-[var(--border,#E5E7EB)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
        variants[variant] || variants.brand,
        className
      )}
      {...props}
    />
  );
}
