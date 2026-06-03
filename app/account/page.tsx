"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Package, User } from "lucide-react";

import { Button } from "@/components/Button";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getMyOrders } from "@/lib/order-service";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type Mode = "login" | "register";
type Tab = "profile" | "orders";

const STATUS_CONFIG: Record<NonNullable<Order["status"]>, { label: string; className: string }> = {
  new: { label: "Received", className: "bg-zinc-100 text-zinc-600" },
  confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-700" },
  shipped: { label: "On the way", className: "bg-amber-50 text-amber-700" },
  delivered: { label: "Delivered", className: "bg-green-50 text-green-700" }
};

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, login, logout, profile, register } = useAuth();
  const { pushToast } = useToast();

  const [mode, setMode] = useState<Mode>("login");
  const [tab, setTab] = useState<Tab>("profile");
  const [isPending, setIsPending] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    firstName: "", lastName: "", phone: "", password: "", confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const displayName = useMemo(() => {
    if (!profile) return "";
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile]);

  useEffect(() => {
    if (!isAuthenticated || tab !== "orders" || ordersLoaded) return;

    let active = true;
    setOrdersLoading(true);

    getMyOrders()
      .then((data) => { if (active) { setOrders(data); setOrdersLoaded(true); } })
      .catch(() => { if (active) setOrders([]); })
      .finally(() => { if (active) setOrdersLoading(false); });

    return () => { active = false; };
  }, [isAuthenticated, tab, ordersLoaded]);

  if (isAuthenticated && !isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">

          {/* Left — profile card */}
          <section className="flex flex-col justify-between overflow-hidden rounded-[2.6rem] bg-ink px-7 py-9 text-white sm:px-9">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-white/40">Fiero account</p>
              <h1 className="mt-5 font-serif text-5xl leading-[0.93] sm:text-6xl">{displayName || "Welcome back"}</h1>
              <p className="mt-4 text-sm leading-7 text-white/50">
                {isAdmin ? "Admin access" : "Customer"}
                {profile?.phone ? ` · ${profile.phone}` : ""}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAdmin ? (
                <Button variant="light" onClick={() => router.push("/admin")}>
                  Admin panel
                </Button>
              ) : null}
              <Button
                variant={isAdmin ? "ghost" : "light"}
                className={isAdmin ? "border border-white/15 text-white hover:bg-white/8" : undefined}
                onClick={() => router.push("/shop")}
              >
                Shop
              </Button>
              <Button
                variant="ghost"
                className="border border-white/15 text-white hover:bg-white/8"
                onClick={() => router.push("/checkout")}
              >
                Checkout
              </Button>
              <Button
                variant="ghost"
                className="border border-white/15 text-white hover:bg-white/8"
                onClick={async () => {
                  await logout();
                  pushToast({ title: "Signed out", tone: "info" });
                }}
              >
                Logout
              </Button>
            </div>
          </section>

          {/* Right — tabs */}
          <section className="rounded-[2.6rem] border border-black/5 bg-white/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:p-7">
            {/* Tab toggle */}
            <div className="grid grid-cols-2 gap-1.5 rounded-full border border-black/8 bg-zinc-50 p-1.5">
              {([
                { id: "profile" as Tab, icon: User, label: "Profile" },
                { id: "orders" as Tab, icon: Package, label: "My Orders" }
              ] as const).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center justify-center gap-2 rounded-full py-3 text-xs uppercase tracking-[0.28em] transition duration-200 ${
                    tab === id
                      ? "bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                      : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Profile tab */}
            {tab === "profile" && (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-400">Profile details</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "First name", value: profile?.firstName },
                    { label: "Last name", value: profile?.lastName },
                    { label: "Phone", value: profile?.phone },
                    { label: "Access", value: isAdmin ? "Admin" : "Customer" }
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-[1.4rem] border border-black/5 bg-zinc-50 px-5 py-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">{label}</p>
                      <p className="mt-2 text-base text-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders tab */}
            {tab === "orders" && (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-400">My orders</p>

                {ordersLoading ? (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonBlock key={i} className="h-24 w-full rounded-[1.6rem]" />
                    ))}
                  </div>
                ) : orders.length ? (
                  <div className="mt-4 space-y-3">
                    {orders.map((order) => {
                      const s = STATUS_CONFIG[order.status ?? "new"];
                      return (
                        <div key={order.id} className="rounded-[1.6rem] border border-black/5 bg-zinc-50 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${s.className}`}>
                                {s.label}
                              </span>
                              <p className="mt-2 text-sm text-zinc-500">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short", day: "numeric"
                                })}
                              </p>
                            </div>
                            <p className="text-lg font-medium text-black">{formatCurrency(order.totalPrice)}</p>
                          </div>

                          <div className="mt-3 space-y-1.5">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm text-zinc-600">
                                <span className="truncate">{item.title} · {item.size} · ×{item.quantity}</span>
                                <span className="ml-4 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <p className="mt-3 text-xs text-zinc-400">{order.address}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.8rem] border border-dashed border-black/10 px-6 py-12 text-center">
                    <Package size={28} className="mx-auto text-zinc-300" />
                    <p className="mt-4 text-sm text-zinc-500">No orders yet.</p>
                    <Button variant="secondary" className="mt-5" onClick={() => router.push("/shop")}>
                      Browse shop
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid min-h-[78svh] gap-5 lg:grid-cols-[0.72fr_1.28fr]">

        {/* Brand panel */}
        <section className="relative flex flex-col justify-between overflow-hidden rounded-[2.6rem] bg-ink px-7 py-9 text-white sm:px-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.07),transparent_55%)]" />
          <div className="pointer-events-none absolute bottom-0 right-0 select-none font-serif text-[12rem] leading-none text-white/[0.035]">F</div>

          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.44em] text-white/40">Fiero</p>
          </div>

          <div className="relative space-y-5">
            <h1 className="font-serif text-5xl leading-[0.92] sm:text-6xl">
              One account.<br />Every drop.
            </h1>
            <p className="max-w-xs text-[15px] leading-7 text-white/55">
              Save pieces to your wishlist, check out faster, and track every order — all from one profile.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                "Wishlist saved to your profile",
                "Phone-based, no email needed",
                "Track order status in real time"
              ].map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm text-white/50">
                  <ArrowRight size={13} className="shrink-0 text-white/30" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex flex-col rounded-[2.6rem] border border-black/5 bg-white/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:p-7">
          <div className="grid grid-cols-2 gap-1.5 rounded-full border border-black/8 bg-zinc-50 p-1.5">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`rounded-full py-3 text-xs uppercase tracking-[0.32em] transition duration-200 ${
                  mode === value
                    ? "bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {value === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <div className="mt-7 flex-1">
            <div className="mb-7">
              <h2 className="font-serif text-4xl text-black sm:text-5xl">
                {mode === "login" ? "Welcome back." : "Create account."}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {mode === "login"
                  ? "Sign in with your phone number and password."
                  : "Fill in the fields below to create your profile."}
              </p>
            </div>

            {mode === "login" ? (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setIsPending(true);
                  try {
                    await login(loginForm);
                    pushToast({ title: "Signed in", tone: "success" });
                    router.push("/shop");
                  } catch (error) {
                    pushToast({
                      title: "Login failed",
                      description: error instanceof Error ? error.message : "Please try again.",
                      tone: "error"
                    });
                  } finally {
                    setIsPending(false);
                  }
                }}
              >
                <Field label="Phone number">
                  <input
                    required
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="+998 90 123 45 67"
                    className={inputClass}
                  />
                </Field>
                <Field label="Password">
                  <PasswordInput
                    value={loginForm.password}
                    onChange={(v) => setLoginForm((c) => ({ ...c, password: v }))}
                    show={showLoginPassword}
                    onToggle={() => setShowLoginPassword((v) => !v)}
                    placeholder="Enter your password"
                  />
                </Field>
                <Button type="submit" fullWidth className="mt-2 min-h-14 rounded-[1.4rem]" disabled={isPending}>
                  {isPending ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (registerForm.password !== registerForm.confirmPassword) {
                    pushToast({ title: "Passwords do not match", tone: "error" });
                    return;
                  }
                  setIsPending(true);
                  try {
                    await register({
                      firstName: registerForm.firstName,
                      lastName: registerForm.lastName,
                      phone: registerForm.phone,
                      password: registerForm.password
                    });
                    pushToast({ title: "Account created", tone: "success" });
                    router.push("/shop");
                  } catch (error) {
                    pushToast({
                      title: "Registration failed",
                      description: error instanceof Error ? error.message : "Please try again.",
                      tone: "error"
                    });
                  } finally {
                    setIsPending(false);
                  }
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name">
                    <input
                      required
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm((c) => ({ ...c, firstName: e.target.value }))}
                      placeholder="First name"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      required
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm((c) => ({ ...c, lastName: e.target.value }))}
                      placeholder="Last name"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Phone number">
                  <input
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="+998 90 123 45 67"
                    className={inputClass}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Password">
                    <PasswordInput
                      value={registerForm.password}
                      onChange={(v) => setRegisterForm((c) => ({ ...c, password: v }))}
                      show={showRegisterPassword}
                      onToggle={() => setShowRegisterPassword((v) => !v)}
                      placeholder="Min. 6 characters"
                    />
                  </Field>
                  <Field label="Repeat password">
                    <PasswordInput
                      value={registerForm.confirmPassword}
                      onChange={(v) => setRegisterForm((c) => ({ ...c, confirmPassword: v }))}
                      show={showRegisterConfirmPassword}
                      onToggle={() => setShowRegisterConfirmPassword((v) => !v)}
                      placeholder="Repeat password"
                    />
                  </Field>
                </div>
                <Button type="submit" fullWidth className="mt-2 min-h-14 rounded-[1.4rem]" disabled={isPending}>
                  {isPending ? "Creating account…" : "Create account"}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const inputClass =
  "min-h-13 w-full rounded-[1.4rem] border border-black/10 bg-zinc-50 px-5 text-sm text-black outline-none transition focus:border-black/25 focus:bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        required
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-black"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
