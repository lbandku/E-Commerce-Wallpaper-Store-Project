import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as apiClient from "../lib/api.js";
import { toastError } from "../lib/toast.js";

const http = apiClient.api || apiClient.default || apiClient;

/* utils */
function fmtMoneyCentsMaybe(v) {
  if (v == null) return "$0.00";
  const n = Number(v);
  if (!Number.isFinite(n)) return "$0.00";
  // treat values >= 50 and integer as cents (e.g., 199 -> 1.99)
  const isCents = Number.isInteger(n) && n >= 50;
  const dollars = isCents ? n / 100 : n;
  return `$${dollars.toFixed(2)}`;
}

function normalizeOrder(raw) {
  const id = raw?._id ?? raw?.id ?? raw?.orderId ?? "";
  const number = raw?.number ?? raw?.orderNumber ?? (id ? id.slice(-8) : "");
  const createdAt = raw?.createdAt ?? raw?.created_at ?? raw?.date ?? null;
  const status = (raw?.status || raw?.paymentStatus || "paid").toLowerCase();
  const customer =
    raw?.customer?.email ||
    raw?.user?.email ||
    raw?.email ||
    raw?.customerEmail ||
    raw?.customer?.name ||
    raw?.user?.name ||
    raw?.name ||
    "—";

  const totalCents =
    raw?.totalCents ??
    raw?.amountTotal ??
    raw?.amount ??
    (Number.isInteger(raw?.total) ? raw?.total : null);

  const total = totalCents != null ? totalCents : raw?.total ?? 0;

  const itemsSrc = raw?.items || raw?.products || raw?.lineItems || [];
  const items = Array.isArray(itemsSrc)
    ? itemsSrc.map((it) => ({
        id: it?._id ?? it?.id ?? it?.productId ?? it?.sku ?? Math.random().toString(36).slice(2),
        title: it?.title ?? it?.name ?? "Wallpaper",
        qty: Number(it?.qty ?? it?.quantity ?? 1),
        priceCents:
          it?.priceCents ??
          (Number.isInteger(Number(it?.price)) && Number(it?.price) >= 50 ? Number(it?.price) : null),
        price: it?.priceCents ? null : (Number(it?.price) || null),
        imageUrl: it?.imageUrl ?? it?.image ?? (Array.isArray(it?.images) ? it.images[0] : ""),
        downloadUrl: it?.downloadUrl ?? it?.url ?? it?.href ?? null,
        category: it?.category ?? it?.tag ?? null,
      }))
    : [];

  return { id, number, createdAt, status, customer, total, items };
}

function toCsv(orders) {
  const rows = [
    ["Order", "Date", "Status", "Customer", "Total", "Line Items"].join(","),
    ...orders.map((o) => {
      const date = o.createdAt ? new Date(o.createdAt).toISOString() : "";
      const items = o.items
        ?.map((i) => `${(i.title || "").replaceAll(",", " ")} (x${i.qty ?? 1})`)
        .join(" | ")
        .replaceAll("\n", " ");
      return [
        `"${o.number || o.id}"`,
        `"${date}"`,
        `"${o.status}"`,
        `"${String(o.customer).replaceAll('"', '""')}"`,
        `"${fmtMoneyCentsMaybe(o.total)}"`,
        `"${(items || "").replaceAll('"', '""')}"`,
      ].join(",");
    }),
  ].join("\n");
  return rows;
}

/* component */
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr("");

    const tryEndpoints = async () => {
      const endpoints = ["/api/admin/orders", "/api/orders", "/api/orders/all"];
      for (const url of endpoints) {
        try {
          const { data } = await http.get(url);
          const list = Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data)
            ? data
            : data?.items || [];
          const normalized = list.map(normalizeOrder);
          if (ok) setOrders(normalized);
          return; // success, stop trying
        } catch {
          // try next
        }
      }
      throw new Error("No orders endpoint responded");
    };

    tryEndpoints()
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.message || "Failed to load orders";
        if (ok) {
          setErr(msg);
          toastError(msg);
        }
      })
      .finally(() => ok && setLoading(false));

    return () => {
      ok = false;
    };
  }, []);

  // filtered orders
  const filtered = useMemo(() => {
    let list = orders;
    if (status !== "all") list = list.filter((o) => (o.status || "").toLowerCase() === status);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((o) => {
        const hay = [
          o.number,
          o.id,
          o.customer,
          o.status,
          ...((o.items || []).map((i) => i.title)),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
    }
    return list;
  }, [orders, q, status]);

  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Orders
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm text-[var(--muted)]">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)] px-3 py-2
                       text-[var(--text)] focus:outline-none focus:ring-2 ring-offset-1
                       ring-offset-[var(--bg,#F8FAFC)] focus:ring-[var(--brand,#2E6F6C)]"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="refunded">Refunded</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
          <label className="text-xs sm:text-sm text-[var(--muted)]">Search:</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order #, email, title…"
            className="w-full sm:w-72 rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                       px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                       focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                       focus:ring-[var(--brand,#2E6F6C)]"
          />
          <button
            type="button"
            onClick={exportCsv}
            className="shrink-0 px-3 py-2 rounded-xl font-semibold text-sm text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
            title="Export filtered orders to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
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
      {!loading && !err && filtered.length === 0 && (
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
          <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">No orders found</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Try a different status or search.</p>
        </div>
      )}

      {/* Orders list */}
      {!loading && !err && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((o) => (
            <article
              key={o.id}
              className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4"
            >
              {/* Header row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <div className="text-[var(--text)]">
                  <div className="font-semibold">
                    Order {o.number || o.id} <span className="text-[var(--muted)]">• {o.customer}</span>
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : "Date unavailable"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold " +
                      ((o.status === "paid" || o.status === "succeeded")
                        ? "bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_14%,transparent)] text-[var(--brand,#2E6F6C)]"
                        : o.status === "pending" || o.status === "processing"
                        ? "bg-[color-mix(in_srgb,#F59E0B_18%,transparent)] text-[#B45309]"
                        : o.status === "refunded" || o.status === "canceled"
                        ? "bg-[color-mix(in_srgb,#EF4444_16%,transparent)] text-[#991B1B]"
                        : "bg-[color-mix(in_srgb,#6B7280_14%,transparent)] text-[#6B7280]")
                    }
                    title={`Status: ${o.status}`}
                  >
                    <i
                      className={
                        "bx " +
                        (o.status === "paid" || o.status === "succeeded"
                          ? "bx-check"
                          : o.status === "pending" || o.status === "processing"
                          ? "bx-time"
                          : "bx-error")
                      }
                    />
                    {o.status}
                  </span>
                  <div className="text-sm font-bold text-[var(--text)]">{fmtMoneyCentsMaybe(o.total)}</div>
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
                          Qty {it.qty ?? 1} •{" "}
                          {fmtMoneyCentsMaybe(it.priceCents != null ? it.priceCents : it.price ?? 0)}
                        </div>
                      </div>

                      {/* Open links (download or preview) */}
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
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold
                                     bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                                     text-[var(--text)]
                                     hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
                          disabled
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
