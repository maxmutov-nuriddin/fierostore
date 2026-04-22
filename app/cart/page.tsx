"use client";

import Link from "next/link";

import { Button } from "@/components/Button";
import { CartItem } from "@/components/CartItem";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <SectionHeading
            eyebrow="Cart"
            title="Your bag stays clean, quick, and editable."
            description="Quantity controls, remove actions, and a fixed mobile checkout make the purchase path friction-light."
          />

          <div className="mt-8 space-y-4">
            {items.length ? (
              items.map((item) => <CartItem key={item.id} item={item} />)
            ) : (
              <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Bag is empty</p>
                <p className="mt-4 text-base leading-7 text-zinc-600">
                  Add a few pieces from the current drop and return here to check out.
                </p>
                <Link href="/shop" className="mt-8 inline-block">
                  <Button>Continue shopping</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2.4rem] border border-black/5 bg-white/85 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Summary</p>
            <div className="mt-6 space-y-4 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-black">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span className="text-black">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-black">Estimated total</span>
                <span className="text-lg text-black">{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-6 block">
              <Button fullWidth disabled={!items.length}>
                Checkout
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      {items.length ? (
        <div className="fixed inset-x-0 bottom-20 border-t border-black/5 bg-white/95 px-4 py-3 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-black">{formatCurrency(subtotal)}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{items.length} items ready</p>
            </div>
            <Link href="/checkout">
              <Button>Checkout</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
