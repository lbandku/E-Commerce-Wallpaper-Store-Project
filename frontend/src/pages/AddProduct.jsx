import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as apiClient from "../lib/api.js";
import { toastSuccess, toastError } from "../lib/toast.js";

const http = apiClient.api || apiClient.default || apiClient;

// Config
const UPLOAD_ENDPOINTS = [
  "/api/upload",
  "/api/admin/upload",
  "/api/uploads",
  "/api/media/upload",
  "/api/files",
  "/api/admin/products/upload",
];
const DATA_URL_MAX_BYTES = 2.5 * 1024 * 1024; // 2.5MB fallback limit

async function tryUploadToAnyEndpoint(file) {
  const form = new FormData();
  // field names backends accept
  form.append("file", file);
  form.append("image", file);

  for (const url of UPLOAD_ENDPOINTS) {
    try {
      const { data } = await http.post(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl =
        data?.url ||
        data?.imageUrl ||
        data?.secure_url ||
        data?.location ||
        data?.path ||
        data?.file?.url ||
        (typeof data === "string" ? data : "");
      if (uploadedUrl) return uploadedUrl;
    } catch {
      // try next
    }
  }
  return "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Could not read file"));
    fr.onload = () => resolve(String(fr.result || ""));
    fr.readAsDataURL(file);
  });
}

export default function AddProduct() {
  const nav = useNavigate();

  // form fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(""); // dollars
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // file upload
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Add Product — ScreenTones";
    return () => { document.title = prev; };
  }, []);

  // Create/revoke preview URL as file changes
  useEffect(() => {
    if (!file) {
      setFilePreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fileLabel = useMemo(() => {
    if (!file) return "No file chosen";
    const kb = (file.size / 1024).toFixed(0);
    return `${file.name} — ${kb} KB`;
  }, [file]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toastError("Please choose an image file");
      return;
    }
    const limitBytes = 15 * 1024 * 1024; // hard cap for upload attempt
    if (f.size > limitBytes) {
      toastError("Image too large (max 15MB)");
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !price || (!imageUrl && !file)) {
      toastError("Title, price, and image (URL or file) are required");
      return;
    }

    setBusy(true);
    try {
      let finalImageUrl = imageUrl.trim();

      // If file chosen, it has priority over URL
      if (file) {
        // 1) Try real upload endpoints
        finalImageUrl = await tryUploadToAnyEndpoint(file);

        // 2) If none work, fall back to Data URL
        if (!finalImageUrl) {
          if (file.size > DATA_URL_MAX_BYTES) {
            toastError(
              "No upload endpoint found and file is too large to embed. Please paste an Image URL or configure an upload route."
            );
            setBusy(false);
            return;
          }
          const dataUrl = await fileToDataUrl(file);
          if (!dataUrl || !dataUrl.startsWith("data:image/")) {
            toastError("Could not embed image");
            setBusy(false);
            return;
          }
          finalImageUrl = dataUrl;
          toastSuccess("Embedded image as Data URL (dev fallback)");
          console.warn(
            "[AddProduct] Using Data URL fallback. For production, add an upload endpoint and return { url: 'https://...' }."
          );
        }
      }

      if (!finalImageUrl) {
        toastError("Could not determine an image URL");
        setBusy(false);
        return;
      }

      const payload = {
        title: title.trim(),
        price: Number(price), // dollars (matches cart/checkout)
        category: category.trim() || undefined,
        imageUrl: finalImageUrl,
        description: description.trim() || undefined,
      };

      // Try common product-create endpoints; first success wins
      const endpoints = ["/api/admin/products", "/api/products", "/api/products/create"];
      let ok = false;
      for (const url of endpoints) {
        try {
          await http.post(url, payload);
          ok = true;
          break;
        } catch {
          // try next
        }
      }

      if (!ok) {
        toastError("Could not create product");
        setBusy(false);
        return;
      }

      toastSuccess("Product created");
      nav("/gallery");
    } catch (err) {
      toastError(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-0">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Add Product
        </h1>
        <div className="mx-auto mt-2 h-[3px] w-24 sm:w-28 rounded-full bg-[var(--brand,#2E6F6C)]/85" />
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="max-w-2xl mx-auto rounded-2xl border border-[var(--border,#E5E7EB)]/60
                   bg-[var(--surface,#fff)]/60 dark:bg-white/5 p-5 sm:p-6 shadow-sm space-y-4"
        noValidate
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)]">Title *</label>
          <input
            className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                       px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                       focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                       focus:ring-[var(--brand,#2E6F6C)]"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Aurora Gradient #12"
            required
          />
        </div>

        {/* Price + Category */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)]">Price (USD) *</label>
            <input
              type="number" step="0.01" min="0"
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              value={price}
              onChange={(e)=>setPrice(e.target.value)}
              placeholder="1.99"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)]">Category</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              value={category}
              onChange={(e)=>setCategory(e.target.value)}
              placeholder="Abstract"
            />
          </div>
        </div>

        {/* Image block: URL OR File */}
        <fieldset className="grid gap-4 sm:grid-cols-5">
          {/* URL input */}
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-[var(--text)]">
              Image URL {file ? "(overridden by uploaded file)" : "*"}
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                         px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                         focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                         focus:ring-[var(--brand,#2E6F6C)]"
              value={imageUrl}
              onChange={(e)=>setImageUrl(e.target.value)}
              placeholder="https://…/wallpaper.jpg"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">
              Paste a direct image URL <span className="opacity-70">(JPG, PNG, WEBP, SVG)</span>.
            </p>
          </div>

          {/* File picker */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--text)]">Upload Image</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("file-input")?.click()}
                className="px-3 py-2 rounded-xl font-semibold text-white
                           bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]"
              >
                Choose file
              </button>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="px-3 py-2 rounded-xl font-semibold
                             bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                             text-[var(--text)]
                             hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--muted)] truncate">{fileLabel}</p>
          </div>
        </fieldset>

        {/* Preview */}
        {(filePreview || imageUrl) && (
          <div className="rounded-2xl border border-[var(--border,#E5E7EB)]/60 p-3 bg-[color-mix(in_srgb,#000_4%,var(--surface,#fff))]">
            <div className="text-xs text-[var(--muted)] mb-2">Preview</div>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl grid place-items-center bg-white/40 dark:bg-white/10">
              <img
                src={filePreview || imageUrl}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)]">Description</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]
                       px-3 py-2 text-[var(--text)] placeholder-[var(--muted,#6B7280)]
                       focus:outline-none focus:ring-2 ring-offset-1 ring-offset-[var(--bg,#F8FAFC)]
                       focus:ring-[var(--brand,#2E6F6C)]"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            placeholder="Short description shown on product card and detail."
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-xl font-semibold text-white
                       bg-[var(--brand,#2E6F6C)] hover:bg-[var(--brand-600,#2F6657)]
                       disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={() => nav("/admin")}
            className="px-4 py-2 rounded-xl font-semibold
                       bg-[color-mix(in_srgb,var(--text,#111)_8%,transparent)]
                       text-[var(--text)]
                       hover:bg-[color-mix(in_srgb,var(--text,#111)_14%,transparent)]"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-[var(--muted)]">
          If a file is selected, it overrides Image URL. If server doesn’t expose an upload route,
          small files fall back to an embedded Data URL (dev-friendly). For production, configure an upload endpoint.
        </p>
      </form>
    </main>
  );
}
