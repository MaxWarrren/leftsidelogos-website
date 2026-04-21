import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem, GroupedCartItem } from '../types';

// ─── Context Shape ───

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  getGroupedItems: () => GroupedCartItem[];
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Hook ───

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

// ─── Helpers ───

function makeId(productId: string, color: string, size: string) {
  return `${productId}::${color}::${size}`;
}

const STORAGE_KEY = 'lsl_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── Provider ───

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  // Persist on change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    const id = makeId(item.productId, item.color, item.size);
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.id !== id));
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const getCartTotal = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity * i.basePrice, 0);
  }, [items]);

  const getGroupedItems = useCallback((): GroupedCartItem[] => {
    const map = new Map<string, GroupedCartItem>();
    for (const item of items) {
      const group = map.get(item.productId);
      const variant = { id: item.id, color: item.color, size: item.size, quantity: item.quantity };
      if (group) {
        group.variants.push(variant);
        group.totalQuantity += item.quantity;
        group.subtotal += item.quantity * item.basePrice;
      } else {
        map.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          category: item.category,
          basePrice: item.basePrice,
          image: item.image,
          variants: [variant],
          totalQuantity: item.quantity,
          subtotal: item.quantity * item.basePrice,
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    getGroupedItems,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount, getCartTotal, getGroupedItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
