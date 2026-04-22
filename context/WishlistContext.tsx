"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

type WishlistContextValue = {
  ids: string[];
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

const STORAGE_KEY = "fierostore.wishlist";

function readStoredWishlist() {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as string[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => readStoredWishlist());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      isSaved(productId) {
        return ids.includes(productId);
      },
      toggle(productId) {
        setIds((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [productId, ...current]
        );
      }
    }),
    [ids]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
