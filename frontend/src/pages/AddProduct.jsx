// frontend/src/pages/AddProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import http from "../lib/api.js";
import { toastError, toastSuccess } from "../lib/toast.js";

const CATEGORIES = ["Nature", "Abstract", "Minimal", "Technology", "Animals", "Holiday"];

// Try endpoints
const CREATE_ENDPOINTS = [
  "/api/products",
  "/api/admin/products",
  "/products",
  "/admin/products",
];

export default function AddProduct() {
  // Protect auth token while form is mounted (prevents accidental logout)
  useEffect(() => {
    const ls = window.localStorage;

    const originalClear = ls.clear?.bind(ls);
    const originalRemoveItem = ls.removeItem?.bind(ls);

    // Keep whichever token key your app uses
    const readToken = () => ls.getItem("jwt") ?? ls.getItem("token");
    const restoreToken = (saved) => {
      if (!saved) return;
      // Prefer the same key you actually use; keep both just in case
      if (ls.getItem("jwt") === null) ls.setItem("jwt", saved);
      if (ls.getItem("token") === null) ls.setItem("token", saved);
    };

    if (originalClear) {
      ls.clear = function () {
        const saved = readToken();
        originalClear();
        restoreToken(saved);
      };
    }

    if (originalRemoveItem) {
      ls.removeItem = function (key) {
        // Ignore attempts to remove auth token
        if (key === "jwt" || key === "token") return;
        return originalRemoveItem(key);
      };
    }

    return () => {
      if (originalClear) ls.clear = originalClear;
      if (originalRemoveItem) ls.removeItem = originalRemoveItem;
    };
  }, []);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );

  const reset = () => {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setPrice("");
    setDescription("");
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toastError("Please choose an image file to upload.");
      return;
    }
    if (!title.trim()) {
      toastError("Title is required.");
      return;
    }
    const p = parseFloat(price);
    if (!Number.isFinite(p) || p <= 0) {
      toastError("Enter a valid price (e.g., 1.99).");
      return;
    }

    setBusy(true);
    try {
      // Build multipart form data; backend expects a file field named "image"
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category);
      if (description.trim()) fd.append("description", description.trim());
      fd.append("price", p);                        // dollars
      fd.append("priceCents", Math.round(p * 100)); // cents (compat)
      fd.append("image", file);                     // <-- IMPORTANT

      let lastErr = null;
      for (const path of CREATE_ENDPOINTS) {
        try {
          const { data } = await http.post(path, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toastSuccess("Product created");
          reset();
          return;
        } catch (e) {
          lastErr = e;
          // try next endpoint
        }
      }

      // If here, none of the endpoints accepted the upload
      throw lastErr || new Error("No product endpoint accepted the upload.");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Could not create product";
      toastError(msg);
    } finally {
      setBusy(false);
      // Revoke object URL if used
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <main className="px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Add Product
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto grid gap-4 rounded-2xl border border-[var(--border,#E5E7EB)]/60 bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-6"
      >
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid gap-2">
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

        <div className="grid gap-2">
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
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 rounded-lg border border-[var(--border,#E5E7EB)] object-contain"
              />
            </div>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                       disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold
                       bg-[var(--surface,#fff)] text-[var(--text)]
                       border border-[var(--border,#E5E7EB)]
                       hover:bg-[color-mix(in_srgb,var(--brand,#2E6F6C)_10%,transparent)]
                       disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </form>

    </main>
  );
}
