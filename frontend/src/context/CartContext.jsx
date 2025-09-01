// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

// --- Helpers ---
const KEY_GUEST = 'cart:guest';
const keyForUser = (user) => {
  // Prefer a stable id; fall back to email/username
  if (!user) return KEY_GUEST;
  return user.id ? `cart:user:${user.id}` :
         user._id ? `cart:user:${user._id}` :
         user.email ? `cart:user:${user.email}` :
         `cart:user:${user.username ?? 'unknown'}`;
};

const readCart = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeCart = (storageKey, cart) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch {
    // ignore quota errors
  }
};

const mergeCarts = (base = [], incoming = []) => {
  // dedupe by product id; sum quantities if present
  const map = new Map();
  for (const it of base) {
    const id = it.id ?? it._id ?? it.sku ?? JSON.stringify(it);
    map.set(id, { ...it });
  }
  for (const it of incoming) {
    const id = it.id ?? it._id ?? it.sku ?? JSON.stringify(it);
    if (map.has(id)) {
      const cur = map.get(id);
      const q1 = Number(cur.qty ?? cur.quantity ?? 1);
      const q2 = Number(it.qty ?? it.quantity ?? 1);
      map.set(id, { ...cur, qty: q1 + q2 });
    } else {
      map.set(id, { ...it });
    }
  }
  return Array.from(map.values());
};

// --- Context ---
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, token } = useAuth(); // assumes your AuthContext exposes user/token
  const [cart, setCart] = useState([]);
  const [storageKey, setStorageKey] = useState(KEY_GUEST);

  // keep a ref to avoid double merge on strict mode re-renders
  const mergedThisSessionRef = useRef(false);

  // Update storage key whenever auth changes
  useEffect(() => {
    const nextKey = keyForUser(token ? user : null);
    setStorageKey(nextKey);
  }, [user, token]);

  // Load the correct cart when the storage key changes
  useEffect(() => {
    if (!storageKey) return;
    const loaded = readCart(storageKey);
    setCart(Array.isArray(loaded) ? loaded : []);

    // On transition from guest -> user: merge guest cart into user cart (once)
    if (storageKey !== KEY_GUEST && !mergedThisSessionRef.current) {
      const guest = readCart(KEY_GUEST);
      if (guest && guest.length) {
        const merged = mergeCarts(loaded, guest);
        setCart(merged);
        writeCart(storageKey, merged);
        // Optionally clear the guest cart after merge:
        writeCart(KEY_GUEST, []);
      }
      mergedThisSessionRef.current = true;
    }

    // On transition user -> guest (logout), we simply show the guest cart (loaded above).
  }, [storageKey]);

  // Persist whenever the active cart changes
  useEffect(() => {
    if (!storageKey) return;
    writeCart(storageKey, cart);
  }, [storageKey, cart]);

  // --- API ---
  const add = (item, qty = 1) => {
    setCart((prev) => {
      const id = item.id ?? item._id ?? item.sku ?? JSON.stringify(item);
      const idx = prev.findIndex((p) => (p.id ?? p._id ?? p.sku ?? JSON.stringify(p)) === id);
      if (idx >= 0) {
        const next = [...prev];
        const curQty = Number(next[idx].qty ?? next[idx].quantity ?? 1);
        next[idx] = { ...next[idx], qty: curQty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const remove = (idLike) => {
    setCart((prev) =>
      prev.filter((p) => (p.id ?? p._id ?? p.sku ?? JSON.stringify(p)) !== (idLike.id ?? idLike._id ?? idLike.sku ?? idLike))
    );
  };

  const setQuantity = (idLike, qty) => {
    setCart((prev) => {
      const id = idLike.id ?? idLike._id ?? idLike.sku ?? idLike;
      return prev.map((p) => {
        const pid = p.id ?? p._id ?? p.sku ?? JSON.stringify(p);
        return pid === id ? { ...p, qty: Math.max(1, Number(qty) || 1) } : p;
      });
    });
  };

  const clear = () => setCart([]);

  const value = useMemo(
    () => ({ cart, add, remove, clear, setQuantity }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};


