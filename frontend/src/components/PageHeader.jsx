// Not currently used; saving to implement during later "ships"
import React from "react";

export default function PageHeader({
  title,
  subtitle,
  align = "center",
  underline = true,
  className = "",
}) {
  const alignCls =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  const lineAlign =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";

  return (
    <div className={`${alignCls} ${className}`}>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-[var(--muted)]">
          {subtitle}
        </p>
      )}
      {underline && (
        <div
          aria-hidden="true"
          className={`${lineAlign} mt-2 h-[3px] w-24 sm:w-28 lg:w-32 rounded-full bg-[var(--brand,#2E6F6C)]/85`}
        />
      )}
    </div>
  );
}
