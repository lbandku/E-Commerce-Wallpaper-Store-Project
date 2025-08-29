import React from 'react';
import { useCart } from '../context/CartContext.jsx';

const formatPrice = (cents) =>
  (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function ProductCard({ item, onBuy }) {
  const { add } = useCart();

  return (
    <article className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition overflow-hidden">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title || 'Wallpaper'}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-4 text-center">
        <div className="mb-1 inline-flex items-center gap-2 justify-center">
          {item.category && (
            <span className="inline-block text-[11px] uppercase tracking-wide bg-gray-900 text-gray-100 px-2 py-1 rounded">
              {item.category}
            </span>
          )}
          <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
        </div>

        <h3 className="mt-1 font-semibold text-base text-gray-900">{item.title}</h3>
        {item.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
        )}

<div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
  <button
    type="button"
    onClick={() => add(item)}
    className="w-full sm:w-auto px-3 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
    aria-label={`Add ${item.title} to cart`}
  >
    Add to cart
  </button>
  <button
    type="button"
    onClick={() => onBuy(item)}
    className="w-full sm:w-auto px-3 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
    aria-label={`Buy ${item.title} now`}
  >
    Buy
  </button>
</div>
      </div>
    </article>
  );
}


