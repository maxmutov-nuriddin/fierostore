"use client";

import Link from "next/link";

import { Button } from "@/components/Button";
import { CartItem } from "@/components/CartItem";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/hooks/useT";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal } = useCart();
  const t = useT();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <SectionHeading
            eyebrow={t.cart.eyebrow}
            title={t.cart.title}
            description={t.cart.desc}
          />

          <div className="mt-8 space-y-4">
            {items.length ? (
              items.map((item) => <CartItem key={item.id} item={item} />)
            ) : (
              <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{t.cart.empty}</p>
                <p className="mt-4 text-base leading-7 text-zinc-600">{t.cart.emptyDesc}</p>
                <Link href="/shop" className="mt-8 inline-block">
                  <Button>{t.cart.continueShopping}</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2.4rem] border border-black/5 bg-white/85 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{t.cart.summary}</p>
            <div className="mt-6 space-y-4 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="text-black">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.cart.delivery}</span>
                <span className="text-black">{t.cart.deliveryCalc}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-black">{t.cart.estimatedTotal}</span>
                <span className="text-lg text-black">{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-6 block">
              <Button fullWidth disabled={!items.length}>{t.cart.checkout}</Button>
            </Link>
          </div>
        </aside>
      </div>

      {items.length ? (
        <div className="fixed inset-x-0 bottom-20 border-t border-black/5 bg-white/95 px-4 py-3 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-black">{formatCurrency(subtotal)}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {items.length} {t.cart.itemsReady}
              </p>
            </div>
            <Link href="/checkout">
              <Button>{t.cart.checkout}</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
