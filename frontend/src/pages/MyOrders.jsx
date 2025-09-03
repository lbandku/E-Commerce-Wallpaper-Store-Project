import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastError } from "../lib/toast.js";
import { api } from "../lib/api.js"; 

/* Currency formatter: supports cents or dollars */
function fmtPrice(itemOrNumber) {
  if (itemOrNumber == null) return "$0.00";
  if (typeof itemOrNumber === "number") {
    return (itemOrNumber >= 50 && Number.isInteger(itemOrNumber))
      ? `$${(itemOrNumber / 100).toFixed(2)}`
      : `$${itemOrNumber.toFixed(2)}`;
  }
  const cents = itemOrNumber.totalCents ?? itemOrNumber.priceCents ?? null;
  if (cents != null) return `$${(Number(cents) / 100).toFixed(2)}`;
  const dollars = Number(itemOrNumber.total ?? itemOrNumber.price ?? 0);
  return `$${(Number.isFinite(dollars) ? dollars : 0).toFixed(2)}`;
}

/* Fallbacks to keep working across slightly different API shapes */
function normalizeOrder(raw) {
  const id = raw?._id ?? raw?.id ?? raw?.orderId ?? "";
  const createdAt = raw?.createdAt ?? raw?.created_at ?? raw?.date ?? null;
  const status = (raw?.status || "paid").toLowerCase();
  const number = raw?.number ?? raw?.orderNumber ?? id?.slice(-8);
  const total = raw?.totalCents ?? raw?.total ?? raw?.amount ?? 0;

  const items =
    raw?.items ||
    raw?.products ||
    raw?.lineItems ||
    [];

  const normItems = Array.isArray(items)
    ? items.map((it) => ({
        id: it?._id ?? it?.id ?? it?.productId ?? it?.sku ?? Math.random().toString(36).slice(2),
        title: it?.title ?? it?.name ?? "Wallpaper",
        qty: Number(it?.qty ?? it?.quantity ?? 1),
        priceCents: it?.priceCents ?? (Number(it?.price) >= 50 && Number.isInteger(Number(it?.price)) ? Number(it?.price) : null),
        price: it?.priceCents ? null : (Number(it?.price) || null),
        imageUrl: it?.imageUrl ?? it?.image ?? (Array.isArray(it?.images) ? it.images[0] : ""),
        downloadUrl: it?.downloadUrl ?? it?.url ?? it?.href ?? null,
        category: it?.category ?? it?.tag ?? null,
      }))
    : [];

  return { id, createdAt, status, number, total, items: normItems };
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const { data } = await api.get?.("/api/orders/my") ?? await api.get("/api/orders/my");
        const list = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data) ? data : (data?.items || []));
        const normalized = list.map(normalizeOrder);
        if (ok) setOrders(normalized);
      } catch (e) {
        const msg = e?.response?.data?.message || "Failed to load your orders";
        if (ok) { setErr(msg); toastError(msg); }
      } finally {
        if (ok) setLoading(false);
      }
    })();

    return () => { ok = false; };
  }, []);

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          My Orders
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Status / Error */}
      {err && !loading && (
        <div className="rounded-xl border border-[color-mix(in_srgb,#ef4444_35%,transparent)] bg-[color-mix(in_srgb,#ef4444_12%,transparent)] text-[var(--text)] p-4 text-center mb-4">
          {err}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border,#E5E7EB)]/50 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4">
              <div className="h-5 w-40 bg-white/40 dark:bg-white/10 rounded mb-3 animate-pulse" />
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((__, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="h-16 w-20 bg-white/40 dark:bg-white/10 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-white/40 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-white/40 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !err && orders.length === 0 && (
        <div className="text-center rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-8">
          <div
            className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl
                       bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_12%,transparent)]
                       text-[var(--brand,#2E6F6C)]
                       border border-[color-mix(in_srgb,var(--brand,#2E6F6C)_40%,black)]"
            aria-hidden="true"
          >
            <i className="bx bx-package text-2xl" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">No orders yet</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            When you purchase wallpapers, your downloads will appear here.
          </p>
          <div className="mt-5">
            <Link
              to="/gallery"
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white
                         bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      )}

      {/* Orders */}
      {!loading && !err && orders.length > 0 && (
        <div className="grid gap-5">
          {orders.map((o) => (
            <article
              key={o.id}
              className="rounded-2xl border border-[var(--border,#E5E7EB)]/60
                         bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4"
            >
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-[var(--text)]">
                  <div className="font-semibold">Order {o.number || o.id}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : "Date unavailable"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold " +
                      (o.status === "paid" || o.status === "succeeded"
                        ? "bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_14%,transparent)] text-[var(--brand,#2E6F6C)]"
                        : "bg-[color-mix(in_srgb,#6B7280_14%,transparent)] text-[#6B7280]")
                    }
                  >
                    <i className={`bx ${o.status === "paid" || o.status === "succeeded" ? "bx-check" : "bx-time"} text-sm`} />
                    {o.status || "paid"}
                  </span>
                  <div className="text-sm font-bold text-[var(--text)]">{fmtPrice({ totalCents: o.total })}</div>
                </div>
              </div>

              {/* Line items */}
              {o.items?.length > 0 && (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 rounded-xl border border-[var(--border,#E5E7EB)]/40 p-3">
                      <div className="h-16 w-20 overflow-hidden rounded bg-[color-mix(in_srgb,#000_6%,var(--surface,#fff))] grid place-items-center">
                        {it.imageUrl ? (
                          <img
                            src={it.imageUrl}
                            alt={it.title || "Wallpaper"}
                            className="object-cover object-center h-full w-full"
                            loading="lazy"
                          />
                        ) : (
                          <i className="bx bx-image text-2xl text-[var(--muted)]" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[var(--text)] truncate">{it.title}</div>
                        <div className="text-xs text-[var(--muted)]">
                          {it.category ? <>{it.category} • </> : null}
                          Qty {it.qty ?? 1} • {fmtPrice(it.priceCents != null ? it.priceCents / 100 : it.price ?? 0)}
                        </div>
                      </div>

                      {/* Download / View */}
{it.downloadUrl ? (
  <a
    href={it.downloadUrl}
    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white
               bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
    target="_blank"
    rel="noopener noreferrer"
  >
    Download
  </a>
) : it.imageUrl ? (
  <a
    href={it.imageUrl}
    className="px-3 py-1.5 rounded-lg text-sm font-semibold
               bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
               text-[var(--text)]
               hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
    target="_blank"
    rel="noopener noreferrer"
    title="Open preview in a new tab"
  >
    View
  </a>
) : (
  <button
    type="button"
    onClick={() => toastError('No preview available for this item.')}
    className="px-3 py-1.5 rounded-lg text-sm font-semibold
               bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
               text-[var(--text)]
               hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
    title="Preview unavailable"
  >
    View
  </button>
)}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
