"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/hooks/useT";
import { useToast } from "@/hooks/useToast";
import { createOrder } from "@/lib/order-service";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, profile, user } = useAuth();
  const { items, subtotal, clearCart, hasHydrated } = useCart();
  const { pushToast } = useToast();
  const t = useT();

  const profileName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/account"); return; }
    if (!hasHydrated) return;
    if (!items.length && !isSuccess) router.replace("/shop");
  }, [isAuthenticated, isSuccess, items.length, router, hasHydrated]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <SectionHeading
            eyebrow={t.checkout.eyebrow}
            title={t.checkout.title}
            description={t.checkout.desc}
          />

          <div className="mt-8 rounded-[2.4rem] border border-black/5 bg-white/85 p-6">
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                try {
                  await createOrder({
                    userId: user?.id ?? profile?.id,
                    customerName: touched.name ? form.name : profileName,
                    phone: touched.phone ? form.phone : (profile?.phone ?? ""),
                    address: form.address,
                    items,
                    totalPrice: subtotal,
                    status: "new"
                  });
                  clearCart();
                  setIsSuccess(true);
                  pushToast({ title: t.checkout.orderPlaced, description: t.checkout.orderPlacedDesc, tone: "success" });
                  window.setTimeout(() => router.push("/"), 2200);
                } catch (error) {
                  pushToast({
                    title: t.checkout.checkoutFailed,
                    description: error instanceof Error ? error.message : undefined,
                    tone: "error"
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input
                required
                value={touched.name ? form.name : profileName}
                onChange={(e) => { setTouched((c) => ({ ...c, name: true })); setForm((c) => ({ ...c, name: e.target.value })); }}
                placeholder={t.checkout.namePlaceholder}
                className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <input
                required
                value={touched.phone ? form.phone : (profile?.phone ?? "")}
                onChange={(e) => { setTouched((c) => ({ ...c, phone: true })); setForm((c) => ({ ...c, phone: e.target.value })); }}
                placeholder={t.checkout.phonePlaceholder}
                className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <textarea
                required
                rows={5}
                value={form.address}
                onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))}
                placeholder={t.checkout.addressPlaceholder}
                className="w-full rounded-[1.8rem] border border-black/10 bg-white px-5 py-4 text-sm outline-none transition focus:border-black/25"
              />
              <Button type="submit" fullWidth disabled={isSubmitting || !items.length}>
                {isSubmitting ? t.checkout.placingOrder : t.checkout.placeOrder}
              </Button>
            </form>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-[1.8rem] bg-black px-5 py-4 text-white"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">{t.checkout.successLabel}</p>
                <p className="mt-2 text-lg">{t.checkout.successMessage}</p>
              </motion.div>
            ) : null}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2.4rem] border border-black/5 bg-black p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.12)]">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">{t.checkout.orderSummary}</p>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">
                      {item.size} / {t.checkout.qty} {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-white/70">{t.checkout.total}</span>
              <span className="text-xl">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
