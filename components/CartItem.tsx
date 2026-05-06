"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useT } from "@/hooks/useT";
import type { CartLine } from "@/lib/types";
import { formatCurrency, shouldBypassImageOptimization } from "@/lib/utils";

export function CartItem({ item }: { item: CartLine }) {
  const { updateQuantity, removeItem } = useCart();
  const t = useT();

  return (
    <article className="grid grid-cols-[96px_1fr] gap-4 rounded-[2rem] border border-black/5 bg-white/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.04)] backdrop-blur sm:grid-cols-[120px_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-zinc-200">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="140px"
            className="object-cover"
            unoptimized={shouldBypassImageOptimization(item.image)}
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-black">{item.title}</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
              {t.cart.sizeColor} {item.size}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-zinc-500">{formatCurrency(item.price)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="rounded-full border border-black/10 p-2 text-zinc-500 transition hover:border-black/20 hover:text-black"
            aria-label={t.cart.remove}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-black/10 p-1">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="rounded-full p-2 text-zinc-600 transition hover:bg-black/5 hover:text-black"
              aria-label={t.cart.decrease}
            >
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center text-sm text-black">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="rounded-full p-2 text-zinc-600 transition hover:bg-black/5 hover:text-black"
              aria-label={t.cart.increase}
            >
              <Plus size={16} />
            </button>
          </div>

          <p className="text-sm uppercase tracking-[0.2em] text-black">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </article>
  );
}
