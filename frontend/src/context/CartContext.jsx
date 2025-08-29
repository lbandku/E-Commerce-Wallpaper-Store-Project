import React, { createContext, useContext, useEffect, useState } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const add = (item) => setCart((c) => [...c, item]);
  const remove = (id) => setCart((c) => c.filter(i => i._id !== id));
  const clear = () => setCart([]);

  return (
    <CartCtx.Provider value={{ cart, add, remove, clear }}>
      {children}
    </CartCtx.Provider>
  );
}


