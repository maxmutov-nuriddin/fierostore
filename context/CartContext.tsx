"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { CartLine, Product, ProductSize } from "@/lib/types";

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, options?: { size?: ProductSize; color?: string; quantity?: number }) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "fierostore.cart";

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem(product, options) {
        const size = options?.size ?? product.sizes[0];
        const color = options?.color ?? product.colors[0];
        const quantity = options?.quantity ?? 1;
        const lineId = `${product.id}-${size}-${color}`;

        setItems((current) => {
          const existing = current.find((item) => item.id === lineId);
          if (existing) {
            return current.map((item) =>
              item.id === lineId ? { ...item, quantity: item.quantity + quantity } : item
            );
          }

          return [
            {
              id: lineId,
              productId: product.id,
              title: product.title,
              image: product.images[0],
              price: product.price,
              size,
              color,
              quantity
            },
            ...current
          ];
        });
      },
      removeItem(lineId) {
        setItems((current) => current.filter((item) => item.id !== lineId));
      },
      updateQuantity(lineId, quantity) {
        setItems((current) =>
          current
            .map((item) => (item.id === lineId ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      clearCart() {
        setItems([]);
      }
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
