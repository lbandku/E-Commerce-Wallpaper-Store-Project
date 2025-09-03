// frontend/src/pages/AdminProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import http from "../lib/api.js";
import { toastError, toastSuccess } from "../lib/toast.js";

const CATEGORIES = ["Nature", "Abstract", "Minimal", "Technology", "Animals", "Holiday"];

// Flexible endpoints to try
const GET_ENDPOINTS = ["/api/admin/products", "/api/products"];
const CREATE_ENDPOINTS = ["/api/products", "/api/admin/products", "/products", "/admin/products"];
const DELETE_PATTERNS = [
  (id) => ({ method: "delete", url: `/api/admin/products/${id}` }),
  (id) => ({ method: "delete", url: `/api/products/${id}` }),
  () => ({ method: "post", url: "/api/admin/products/delete" }),
  () => ({ method: "post", url: "/api/products/delete" }),
];

function normalizeProducts(data) {
  const arr = Array.isArray(data) ? data : data?.items || data?.products || data?.data || [];
  return arr.map((p) => {
    const id = p._id || p.id || p.productId || p.uuid || p.slug || String(Math.random());
    const title = p.title || p.name || "Untitled";
    // prefer dollars; fall back to cents
    let price =
      p.price != null
        ? Number(p.price)
        : p.priceCents != null
        ? Number(p.priceCents) / 100
        : 0;
    // light guard if backend stored cents in `price`
    if (price >= 50 && price % 1 === 0) price = price / 100;

    const imageUrl = p.imageUrl || p.image || (Array.isArray(p.images) ? p.images[0] : "");
    const category = p.category || p.tag || "";
    const description = p.description || p.desc || "";
    return { id, title, price, imageUrl, category, description, raw: p };
  });
}

export default function AdminProducts() {
  // add form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("1.99");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  // inventory state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const prev = document.title;
    document.title = "Manage Products — ScreenTones";
    fetchProducts();
    return () => (document.title = prev);
  }, []);

  const resetForm = () => {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setPrice("1.99");
    setDescription("");
    setFile(null);
  };

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
        } catch {
          // try next
        }
      }
      throw new Error("No products endpoint responded");
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load products");
      setLoading(false);
    }
  };

  const addSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toastError("Please choose an image file to upload.");
    if (!title.trim()) return toastError("Title is required.");

    const p = parseFloat(price);
    if (!Number.isFinite(p) || p <= 0) return toastError("Enter a valid price (e.g., 1.99).");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category);
      if (description.trim()) fd.append("description", description.trim());
      fd.append("price", p);
      fd.append("priceCents", Math.round(p * 100));
      fd.append("image", file);

      let lastErr = null;
      for (const path of CREATE_ENDPOINTS) {
        try {
          await http.post(path, fd, { headers: { "Content-Type": "multipart/form-data" } });
          toastSuccess("Product created");
          resetForm();
          await fetchProducts();
          return;
        } catch (e2) {
          lastErr = e2;
        }
      }
      throw lastErr || new Error("No product endpoint accepted the upload.");
    } catch (e) {
      toastError(e?.response?.data?.message || e.message || "Could not create product");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) =>
      [it.title, it.category, it.description].filter(Boolean).some((s) => s.toLowerCase().includes(t))
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
          } else {
            await http.post(cfg.url, { id: it.id });
          }
          toastSuccess("Deleted");
          setItems((xs) => xs.filter((x) => x.id !== it.id));
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      const msg = lastErr?.response?.data?.message || lastErr?.message || "Delete failed";
      toastError(msg);
    } catch (e) {
      toastError(e?.message || "Delete failed");
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

      <div className="mx-auto max-w-7xl">
        {/* Add Product form (top) */}
        <form
          onSubmit={addSubmit}
          className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2">Add Product</h2>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[var(--text)]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kitten on Sofa"
              className="rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--text)]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                           px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2
                           ring-offset-1 ring-offset-[var(--bg,#F8FAFC)] focus:ring-[var(--brand,#2E6F6C)]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--text)]">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1.99"
                className="rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                           px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                           focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                           focus:ring-[var(--brand,#2E6F6C)]"
                required
              />
            </div>
          </div>

          <div className="grid gap-2 mt-3">
            <label className="text-sm font-medium text-[var(--text)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description of the wallpaper"
              className="rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
            />
          </div>

          <div className="grid gap-2 mt-3">
            <label className="text-sm font-medium text-[var(--text)]">Image file</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-[var(--text)]
                         file:mr-4 file:py-2 file:px-4 file:rounded-lg
                         file:border-0 file:text-sm file:font-semibold
                         file:bg-[var(--brand,#2E6F6C)] file:text-white
                         hover:file:bg-[var(--brand-600,#2F6657)]"
              required
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-white
                         bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                         disabled:opacity-60"
            >
              {busy ? "Adding…" : "Add Product"}
            </button>

            {/* Clear button */}
            <button
              type="button"
              onClick={resetForm}
              disabled={busy}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold
                         text-white bg-neutral-900 hover:bg-neutral-800
                         disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Inventory */}
        <section id="inventory">
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
              className="px-3 py-2 rounded-xl font-semibold text-white bg-neutral-900 hover:bg-neutral-800"
            >
              Refresh
            </button>
          </div>

          {loading && <div className="text-[var(--muted)]">Loading products…</div>}
          {!loading && err && (
            <div className="rounded-xl border p-4 text-[var(--danger,#ef4444)]">{err}</div>
          )}
          {!loading && !err && filtered.length === 0 && (
            <div className="text-[var(--muted)]">No products match your filter.</div>
          )}

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
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--text)] leading-tight truncate">
                        {it.title}
                      </div>
                      <div className="text-sm text-[var(--muted)]">{it.category || "—"}</div>
                    </div>
                    <div className="text-sm font-bold text-[var(--text)]">
                      ${Number(it.price || 0).toFixed(2)}
                    </div>
                  </div>

                  {it.description && (
                    <p className="text-sm text-[var(--muted)] line-clamp-2">{it.description}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => del(it)}
                      className="px-3 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
