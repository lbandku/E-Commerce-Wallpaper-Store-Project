// frontend/src/components/ProductCard.jsx
import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { toastSuccess } from '../lib/toast.js';
import { useTheme } from '../context/ThemeContext.jsx';

const formatPrice = (cents) =>
  (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function ProductCard({ item, onBuy }) {
  const { add } = useCart();
  const { isDark } = useTheme();

  const img = item.imageUrl || 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg"/>'; // tiny fallback

  const onAddToCart = () => {
    add(item);
    toastSuccess('Added to cart');
  };

  const cardClass = isDark
    ? 'group rounded-2xl shadow-sm ring-1 overflow-hidden bg-gray-900 ring-gray-800'
    : 'group bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden';

  const imgWrapClass = isDark ? 'aspect-[4/3] w-full overflow-hidden bg-gray-800'
                              : 'aspect-[4/3] w-full overflow-hidden bg-gray-100';

  const priceTextClass = isDark ? 'font-semibold text-gray-100'
                                : 'font-semibold text-gray-900';

  const titleTextClass = isDark ? 'mt-1 font-semibold text-base text-gray-100'
                                : 'mt-1 font-semibold text-base text-gray-900';

  const descTextClass = isDark ? 'mt-1 text-sm text-gray-400 line-clamp-2'
                               : 'mt-1 text-sm text-gray-500 line-clamp-2';

  const chipClass = isDark
    ? 'font-semibold inline-block text-[11px] uppercase tracking-wide bg-gray-700 text-gray-100 px-3 py-1 rounded'
    : 'font-semibold inline-block text-[11px] uppercase tracking-wide bg-gray-200 text-gray-900 px-3 py-1 rounded';

  // Buttons
  const addBtnClass = isDark
  // Dark theme → match Buy button
  ? 'px-4 py-2 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-700 text-white'
  // Light theme → keep dark background with white text
  : 'px-4 py-2 rounded-lg font-medium transition bg-gray-900 hover:bg-gray-700 text-white';

const buyBtnClass = onBuy
  ? 'w-full sm:w-auto px-3 py-3 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white'
  : 'w-full sm:w-auto px-3 py-3 rounded-lg text-sm bg-gray-100 text-gray-400 cursor-not-allowed';

  return (
    <article className={cardClass}>
      <div className={imgWrapClass}>
        <img
          src={img}
          alt={item.title || 'Wallpaper'}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-4 text-center">
        <div className="mb-1 inline-flex items-center gap-2 justify-center">
          {item.category && (
            <span className={chipClass}>
              {item.category}
            </span>
          )}
          <span className={priceTextClass}>
            {formatPrice(item.price ?? 0)}
          </span>
        </div>

        <h3 className={titleTextClass}>{item.title}</h3>

        {item.description && (
          <p className={descTextClass}>{item.description}</p>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
          <button
            type="button"
            className={addBtnClass}
            onClick={onAddToCart}
            aria-label={`Add ${item.title} to cart`}
          >
            Add to Cart
          </button>

          <button
            type="button"
            onClick={() => onBuy?.(item)}
            disabled={!onBuy}
            className={buyBtnClass}
            aria-label={`Buy ${item.title} now`}
          >
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}
