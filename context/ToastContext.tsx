"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

import type { ToastItem, ToastTone } from "@/lib/types";

type ToastContextValue = {
  items: ToastItem[];
  pushToast: (input: { title: string; description?: string; tone?: ToastTone }) => void;
  dismissToast: (toastId: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((toastId: string) => {
    setItems((current) => current.filter((item) => item.id !== toastId));
  }, []);

  const pushToast = useCallback(
    ({ title, description, tone = "info" }: { title: string; description?: string; tone?: ToastTone }) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}`;

      setItems((current) => [...current, { id, title, description, tone }]);

      window.setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      items,
      pushToast,
      dismissToast
    }),
    [dismissToast, items, pushToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
