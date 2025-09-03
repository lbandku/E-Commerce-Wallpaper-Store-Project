import { useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Background", light: "var(--bg)", dark: "var(--bg)" },
  { name: "Surface", light: "var(--surface)", dark: "var(--surface)" },
  { name: "Text", light: "var(--text)", dark: "var(--text)" },
  { name: "Muted", light: "var(--muted)", dark: "var(--muted)" },
  { name: "Brand", light: "var(--brand)", dark: "var(--brand)" },
  { name: "Brand 600", light: "var(--brand-600)", dark: "var(--brand-600)" },
  { name: "Accent", light: "var(--accent)", dark: "var(--accent)" },
  { name: "Highlight", light: "var(--highlight)", dark: "var(--highlight)" },
  { name: "Success", light: "var(--success)", dark: "var(--success)" },
  { name: "Danger", light: "var(--danger)", dark: "var(--danger)" },
];

const Swatch = ({ label, color }) => (
  <div className="flex flex-col items-center space-y-1">
    <div
      className="w-16 h-16 rounded-2xl shadow"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs font-medium text-[var(--text)]">
      {label}
    </span>
    <span className="text-[10px] text-[var(--muted)]">{color}</span>
  </div>
);

const Btn = ({ variant, children }) => {
  const base =
    "px-4 py-2 rounded-[var(--radius-lg)] font-semibold transition focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-[var(--surface)]";
  const variants = {
    primary: "bg-[var(--brand)] text-white hover:bg-[var(--brand-600)] shadow-sm",
    secondary: "bg-[var(--surface)] border border-[var(--border)] text-[var(--brand-600)] hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]",
    ghost: "bg-transparent text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--bg)_90%,#000)]",
  };
  return <button className={cn(base, variants[variant])}>{children}</button>;
};

export default function ThemeDemo() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Theme Demo</h1>
          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2">Color Tokens</h2>
        <div className="grid grid-cols-5 gap-4 mb-8">
          {COLORS.map((c) => (
            <Swatch key={c.name} label={c.name} color={dark ? c.dark : c.light} />
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-2">Buttons</h2>
        <div className="flex gap-4">
          <Btn variant="primary">Primary</Btn>
          <Btn variant="secondary">Secondary</Btn>
          <Btn variant="ghost">Ghost</Btn>
        </div>
      </div>
    </div>
  );
}

