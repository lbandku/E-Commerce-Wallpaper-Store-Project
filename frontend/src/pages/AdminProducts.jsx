import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as apiClient from "../lib/api.js";
import { toastSuccess, toastError } from "../lib/toast.js";

const http = apiClient.api || apiClient.default || apiClient;

// Flexible endpoints
const GET_ENDPOINTS = ["/api/admin/products", "/api/products"];
const DELETE_PATTERNS = [
  (id) => ({ method: "delete", url: `/api/admin/products/${id}` }),
  (id) => ({ method: "delete", url: `/api/products/${id}` }),
  () => ({ method: "post", url: "/api/admin/products/delete" }), // body: { id }
  () => ({ method: "post", url: "/api/products/delete" }),
];
const CREATE_ENDPOINTS = [
  "/api/admin/products",
  "/api/products",
  "/api/products/create",
  "/api/admin/products/add",
];

function normalizeProducts(data) {
  const arr = Array.isArray(data) ? data : data?.items || data?.products || data?.data || [];
  return arr.map((p) => {
    const id = p._id || p.id || p.productId || p.uuid || p.slug || String(Math.random());
    const title = p.title || p.name || "Untitled";
    const price =
      p.price != null
        ? Number(p.price)
        : p.priceCents != null
        ? Number(p.priceCents) / 100
        : 0;
    const imageUrl = p.imageUrl || p.image || (Array.isArray(p.images) ? p.images[0] : "");
    const category = p.category || p.tag || "";
    const description = p.description || p.desc || "";
    return { id, title, price, imageUrl, category, description, raw: p };
  });
}

export default function AdminProducts() {
  const [tab, setTab] = useState("inventory"); // 'inventory' | 'add'
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [qa, setQa] = useState({ title: "", price: "", imageUrl: "" });

  const fetchProducts = async () => {
    setLoading(true);
    setErr("");
    try {
      for (const url of GET_ENDPOINTS) {
        try {
          const { data } = await http.get(url, { params: { limit: 1000 } });
          setItems(normalizeProducts(data));
          setLoading(false);
          return;
        } catch (_) {
          // try next endpoint
        }
      }
      throw new Error("No products endpoint responded");
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load products"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const prev = document.title;
    document.title = "Manage Products — ScreenTones";
    fetchProducts();
    return () => (document.title = prev);
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) =>
      [it.title, it.category, it.description]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(t))
    );
  }, [items, q]);

  const del = async (it) => {
    if (!confirm(`Delete “${it.title}”? This cannot be undone.`)) return;
    try {
      let lastErr = null;
      for (const pattern of DELETE_PATTERNS) {
        try {
          const cfg = pattern(it.id);
          if (cfg.method === "delete") {
            await http.delete(cfg.url);
            toastSuccess("Deleted");
            setItems((xs) => xs.filter((x) => x.id !== it.id));
            return;
          } else {
            await http.post(cfg.url, { id: it.id });
            toastSuccess("Deleted");
            setItems((xs) => xs.filter((x) => x.id !== it.id));
            return;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      const msg =
        lastErr?.response?.data?.message ||
        lastErr?.message ||
        "Delete failed";
      toastError(msg);
    } catch (e) {
      toastError(e?.message || "Delete failed");
    }
  };

  const quickAdd = async (e) => {
    e.preventDefault();
    if (!qa.title || !qa.price || !qa.imageUrl) {
      toastError("Title, price, and image URL are required");
      return;
    }
    setCreating(true);
    try {
      const priceNumber = Number(qa.price);
      const payload = {
        // common names
        title: qa.title.trim(),
        name: qa.title.trim(),
        price: priceNumber,
        priceCents: Math.round(priceNumber * 100),
        imageUrl: qa.imageUrl.trim(),
        image: qa.imageUrl.trim(),
        images: [qa.imageUrl.trim()],
      };

      let created = false;
      let lastErr = null;
      for (const url of CREATE_ENDPOINTS) {
        for (const body of [payload, { product: payload }]) {
          try {
            await http.post(url, body);
            created = true;
            break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (created) break;
      }
      if (!created) {
        const msg =
          lastErr?.response?.data?.message ||
          lastErr?.message ||
          "Could not create product";
        toastError(msg);
        setCreating(false);
        return;
      }

      toastSuccess("Product created");
      setQa({ title: "", price: "", imageUrl: "" });
      await fetchProducts();
      setTab("inventory");
    } catch (e) {
      toastError(e?.message || "Could not create product");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Manage Products
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-2 mb-4">
          <button
            className={
              "px-3 py-2 rounded-xl font-semibold " +
              (tab === "inventory"
                ? "bg-[var(--brand,#2E6F6C)] text-white"
                : "bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)] text-[var(--text)]")
            }
            onClick={() => setTab("inventory")}
          >
            Inventory
          </button>
          <button
            className={
              "px-3 py-2 rounded-xl font-semibold " +
              (tab === "add"
                ? "bg-[var(--brand,#2E6F6C)] text-white"
                : "bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)] text-[var(--text)]")
            }
            onClick={() => setTab("add")}
          >
            Add Product
          </button>
        </div>

        {tab === "inventory" && (
          <section>
            {/* Search + Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, category, description"
                className="w-full sm:max-w-sm rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)] px-3 py-2 text-[var(--text)]"
              />
              <button
                type="button"
                onClick={fetchProducts}
                className="px-3 py-2 rounded-xl font-semibold text-[var(--text)]
                           bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                           hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
              >
                Refresh
              </button>
              <Link
                to="/admin/add-product"
                className="px-3 py-2 rounded-xl font-semibold text-white
                           bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
              >
                Open Full Add Product Form
              </Link>
            </div>

            {/* States */}
            {loading && (
              <div className="text-[var(--muted)]">Loading products…</div>
            )}
            {!loading && err && (
              <div className="rounded-xl border p-4 text-[var(--danger,#ef4444)]">
                {err}
              </div>
            )}
            {!loading && !err && filtered.length === 0 && (
              <div className="text-[var(--muted)]">
                No products match your filter.
              </div>
            )}

            {/* Grid */}
            {!loading && !err && filtered.length > 0 && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-3 flex flex-col gap-3"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-white/40 dark:bg-white/10">
                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          alt={it.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[var(--muted)] text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[var(--text)] leading-tight">
                          {it.title}
                        </div>
                        <div className="text-sm text-[var(--muted)]">
                          {it.category || "—"}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[var(--text)]">
                        ${Number(it.price || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => del(it)}
                        className="px-3 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                      {/* placeholder for future edit */}
                      {/* <button className="px-3 py-2 rounded-xl font-semibold bg-gray-900 text-white">Edit</button> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "add" && (
          <section className="grid gap-4 md:grid-cols-2">
            {/* Quick Add */}
            <form
              onSubmit={quickAdd}
              className="rounded-2xl border border-[var(--border,#E5E7EB)]/60
                         bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4 space-y-3"
            >
              <h2 className="font-semibold text-[var(--text)] text-lg">
                Quick Add
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Fast path: Title, Price, and Image URL. For file uploads or more
                fields, use the full form.
              </p>

              <div>
                <label className="block text-sm text-[var(--text)]">Title *</label>
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                             px-3 py-2 text-[var(--text)]"
                  value={qa.title}
                  onChange={(e) => setQa((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Aurora Gradient #12"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[var(--text)]">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                               px-3 py-2 text-[var(--text)]"
                    value={qa.price}
                    onChange={(e) =>
                      setQa((s) => ({ ...s, price: e.target.value }))
                    }
                    placeholder="1.99"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text)]">Image URL *</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                               px-3 py-2 text-[var(--text)]"
                    value={qa.imageUrl}
                    onChange={(e) =>
                      setQa((s) => ({ ...s, imageUrl: e.target.value }))
                    }
                    placeholder="https://…/wallpaper.jpg"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl font-semibold text-white
                             bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                             disabled:opacity-60"
                >
                  {creating ? "Adding…" : "Add Product"}
                </button>
              </div>
            </form>

            {/* Full form */}
            <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60
                            bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-4">
              <h2 className="font-semibold text-[var(--text)] text-lg mb-2">
                Full Add Product
              </h2>
              <p className="text-sm text-[var(--muted)] mb-3">
                Need file upload or additional fields? Use the full add form.
              </p>
              <Link
                to="/admin/add-product"
                className="inline-flex px-4 py-2 rounded-xl font-semibold text-white
                           bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
              >
                Open Full Add Product Form
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
