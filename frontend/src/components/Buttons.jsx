
import { cn } from "@/lib/utils"; // helper to combine classNames

const baseBtn =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] text-sm font-semibold transition active:translate-y-px focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-[var(--surface)]";

export function BtnPrimary({ children, className = "", ...props }) {
  return (
    <button
      className={cn(
        baseBtn,
        "bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white shadow-sm hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({ children, className = "", ...props }) {
  return (
    <button
      className={cn(
        baseBtn,
        "bg-[var(--surface)] text-[var(--brand-600)] border border-[var(--border)] hover:bg-[var(--brand-100)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, className = "", ...props }) {
  return (
    <button
      className={cn(
        baseBtn,
        "bg-transparent text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--bg)_90%,#000)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
