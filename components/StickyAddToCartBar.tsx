"use client";

import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/Button";
import type { Product, ProductSize } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function StickyAddToCartBar({
  product,
  size,
  color,
  onAdd
}: {
  product: Product;
  size: ProductSize;
  color: string;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-40 border-t border-black/5 bg-white/95 px-4 py-3 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-black">{product.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
            {size} / {formatCurrency(product.price)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color }} />
            <span className="text-xs text-zinc-500">Ready to ship</span>
          </div>
        </div>
        <Button iconLeft={<ShoppingBag size={16} />} onClick={onAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
