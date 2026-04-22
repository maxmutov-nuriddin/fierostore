"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { createOrder } from "@/lib/order-service";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, profile, user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { pushToast } = useToast();
  const [form, setForm] = useState({
    name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "",
    phone: profile?.phone ?? "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/account");
      return;
    }

    if (!items.length && !isSuccess) {
      router.replace("/shop");
    }
  }, [isAuthenticated, isSuccess, items.length, router]);

  useEffect(() => {
    if (!profile) return;

    setForm((current) => ({
      ...current,
      name: current.name || `${profile.firstName} ${profile.lastName}`.trim(),
      phone: current.phone || profile.phone
    }));
  }, [profile]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <SectionHeading
            eyebrow="Checkout"
            title="Finish the order in under twenty seconds."
            description="Only the fields that matter: name, phone, address, and a clean confirmation state."
          />

          <div className="mt-8 rounded-[2.4rem] border border-black/5 bg-white/85 p-6">
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);

                try {
                  await createOrder({
                    userId: user?.uid ?? profile?.id,
                    customerName: form.name,
                    phone: form.phone,
                    address: form.address,
                    items,
                    totalPrice: subtotal,
                    status: "new"
                  });

                  clearCart();
                  setIsSuccess(true);
                  pushToast({
                    title: "Order placed successfully",
                    description: "We will contact you soon to confirm delivery.",
                    tone: "success"
                  });

                  window.setTimeout(() => router.push("/"), 2200);
                } catch (error) {
                  pushToast({
                    title: "Checkout failed",
                    description: error instanceof Error ? error.message : "Please try again.",
                    tone: "error"
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full name"
                className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone number"
                className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <textarea
                required
                rows={5}
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                placeholder="Delivery address"
                className="w-full rounded-[1.8rem] border border-black/10 bg-white px-5 py-4 text-sm outline-none transition focus:border-black/25"
              />

              <Button type="submit" fullWidth disabled={isSubmitting || !items.length}>
                {isSubmitting ? "Placing order..." : "Place order"}
              </Button>
            </form>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-[1.8rem] bg-black px-5 py-4 text-white"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Success</p>
                <p className="mt-2 text-lg">Order created. Redirecting back to home.</p>
              </motion.div>
            ) : null}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2.4rem] border border-black/5 bg-black p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.12)]">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Order summary</p>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">
                      {item.size} / Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-white/70">Total</span>
              <span className="text-xl">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
