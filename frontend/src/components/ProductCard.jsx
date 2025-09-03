import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { Card, CardBody, Badge, BtnPrimary } from "./ui/Primitives.jsx";

/* Price formatter: supports dollars or cents; currently set for dollars and cents view */
function formatPrice(item) {
  if (item?.priceCents != null) return `$${(item.priceCents / 100).toFixed(2)}`;
  const n = Number(item?.price);
  if (!Number.isFinite(n)) return "";
  const dollars = Number.isInteger(n) && n >= 50 ? n / 100 : n; // 199 -> 1.99
  return `$${dollars.toFixed(2)}`;
}

/* Image helper: handles string or {url} */
function getImageSrc(item) {
  const raw =
    item?.image ||
    item?.imageUrl ||
    item?.thumbnail ||
    (Array.isArray(item?.images) ? item.images[0] : "");
  if (!raw) return "";
  return typeof raw === "string" ? raw : raw?.url || "";
}

export default function ProductCard({ item, onBuy, priority = false }) {
  const cartCtx = (typeof useCart === "function" ? useCart() : {}) || {};
  const addToCart = cartCtx.addToCart || cartCtx.add || cartCtx.addItem || (() => {});
  const imgSrc = getImageSrc(item);
  const title = item?.title || "Wallpaper";

  return (
    <Card
      className="
        product-card group overflow-hidden
        border border-white/5 bg-black/30
        hover:border-white/10 hover:shadow-lg/20
        transition focus-within:ring-2 ring-[var(--brand,#2E6F6C)]
      "
    >
      {/* CSS-styling to make text readable on gray card */}
      <style>{`
        .product-card .product-title { color: #ffffff !important; }
        .product-card .product-price { color: rgba(255,255,255,0.92) !important; }
        .product-card .product-desc  { color: #e5e7eb !important; }  /* light gray */
        .dark .product-card .product-desc { color: #d1d5db !important; }
        .product-card .card-body { background: transparent !important; }
      `}</style>

      {/* Consistent crop; slight hover lift (motion-safe) */}
      <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/10] bg-black/20">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center
                       transform-gpu will-change-transform
                       motion-safe:transition-transform motion-safe:duration-300
                       group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-neutral-400 text-sm">
            No image
          </div>
        )}
      </div>

      {/* Equal-height layout: regardless of how long description and info are */}
      <CardBody
        className="card-body px-5 pt-4 pb-5 grid gap-3 !bg-transparent"
        style={{ gridTemplateRows: "auto auto 1fr auto" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {item?.category && (
              <Badge variant="outline" className="uppercase tracking-wide">
                {String(item.category)}
              </Badge>
            )}
          </div>
          <div className="product-price font-semibold text-sm">
            {formatPrice(item)}
          </div>
        </div>

        <h3 className="product-title font-semibold leading-tight">
          {title}
        </h3>

        {item?.description && (
          <p
            className="product-desc antialiased text-[15px] leading-[1.55]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={item.description}
          >
            {item.description}
          </p>
        )}

        <div className="pt-1 flex gap-2">
          <BtnPrimary onClick={() => addToCart(item)}>
            Add to Cart
          </BtnPrimary>
          <BtnPrimary onClick={() => onBuy?.(item)}>
            Buy
          </BtnPrimary>
        </div>
      </CardBody>
    </Card>
  );
}
