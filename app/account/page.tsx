"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

type Mode = "login" | "register";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, login, logout, profile, register } = useAuth();
  const { pushToast } = useToast();
  const [mode, setMode] = useState<Mode>("register");
  const [isPending, setIsPending] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({
    phone: "",
    password: ""
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const displayName = useMemo(() => {
    if (!profile) return "";
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile]);

  if (isAuthenticated && !isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2.6rem] border border-black/5 bg-black px-6 py-10 text-white sm:px-8 lg:px-10">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Account</p>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl">{displayName || "Signed in"}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              You can save products, place orders, and return later without losing your shopping flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="light" onClick={() => router.push("/shop")}>
                Continue shopping
              </Button>
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={() => router.push("/checkout")}>
                Checkout
              </Button>
              {isAdmin ? (
                <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={() => router.push("/admin")}>
                  Open admin
                </Button>
              ) : null}
            </div>
          </section>

          <aside className="rounded-[2.6rem] border border-black/5 bg-white/85 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Profile details</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-black/5 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">First name</p>
                <p className="mt-2 text-lg text-black">{profile?.firstName}</p>
              </div>
              <div className="rounded-[1.6rem] border border-black/5 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Last name</p>
                <p className="mt-2 text-lg text-black">{profile?.lastName}</p>
              </div>
              <div className="rounded-[1.6rem] border border-black/5 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Phone</p>
                <p className="mt-2 text-lg text-black">{profile?.phone}</p>
              </div>
              <div className="rounded-[1.6rem] border border-black/5 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Access</p>
                <p className="mt-2 text-lg text-black">{isAdmin ? "Admin" : "Customer"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-6 border border-black/10"
              onClick={async () => {
                await logout();
                pushToast({ title: "Signed out", tone: "info" });
              }}
            >
              Logout
            </Button>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <section>
          <div className="relative overflow-hidden rounded-[2.8rem] border border-black/5 bg-[#111111] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.14)] sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_24%)]" />
            <div className="pointer-events-none absolute -right-10 top-10 font-serif text-[8rem] leading-none text-white/4 sm:text-[11rem]">
              FI
            </div>

            <div className="relative flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.42em] text-white/45">FIERO</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/32">Private customer access</p>
                </div>
                <div className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/50">
                  Members
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/36">Account</p>
                <h1 className="mt-5 max-w-lg font-serif text-[3.3rem] leading-[0.94] text-white sm:text-[3.9rem] xl:text-[4rem]">
                  A quieter way
                  <br />
                  to save pieces
                  <br />
                  and check out faster.
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-7 text-white/62">
                  Create one customer profile to keep favorites, place orders, and return without starting from zero.
                </p>
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                {[
                  ["01", "Wishlist", "Saved products stay attached to your profile."],
                  ["02", "Orders", "Checkout details stay ready for faster repeat purchases."],
                  ["03", "Access", "Phone and password unlock a cleaner buying flow."]
                ].map(([index, title, copy]) => (
                  <div
                    key={title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur"
                  >
                    <p className="text-[11px] uppercase tracking-[0.34em] text-white/30">{index}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-white/52">{title}</p>
                    <p className="mt-2.5 text-[15px] leading-7 text-white/62">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-white/10 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-serif text-[2.8rem] leading-none text-white sm:text-[3.15rem]">FIERO</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.34em] text-white/34">
                      Fashion storefront membership
                    </p>
                  </div>
                  <p className="max-w-[150px] text-right text-[13px] leading-6 text-white/42">
                    Built for wishlist, faster checkout, and cleaner order handling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.8rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.08)] sm:p-4">
          <div className="rounded-[2.2rem] border border-black/5 bg-white/90 p-4 sm:p-6">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Customer access</p>
                  <h2 className="mt-2 font-serif text-3xl text-black sm:text-4xl">
                    {mode === "register" ? "Create your account" : "Welcome back"}
                  </h2>
                </div>
                <p className="hidden max-w-[180px] text-right text-sm leading-6 text-zinc-500 sm:block">
                  Clean entry point for wishlist, checkout, and repeat orders.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-black/10 bg-zinc-50 p-1.5">
                {(["register", "login"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={`rounded-full px-4 py-3 text-xs uppercase tracking-[0.3em] transition ${
                      mode === value
                        ? "bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                        : "text-zinc-500 hover:text-black"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {mode === "register" ? (
                <form
                  className="mt-8 space-y-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (registerForm.password !== registerForm.confirmPassword) {
                      pushToast({
                        title: "Passwords do not match",
                        description: "Repeat the same password in both fields.",
                        tone: "error"
                      });
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
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                        First name
                      </span>
                      <input
                        required
                        value={registerForm.firstName}
                        onChange={(event) =>
                          setRegisterForm((current) => ({ ...current, firstName: event.target.value }))
                        }
                        placeholder="Your firstName"
                        className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                        Last name
                      </span>
                      <input
                        required
                        value={registerForm.lastName}
                        onChange={(event) =>
                          setRegisterForm((current) => ({ ...current, lastName: event.target.value }))
                        }
                        placeholder="Your lastName"
                        className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                      Phone number
                    </span>
                    <input
                      required
                      value={registerForm.phone}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="+998 90 123 45 67"
                      className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                    />
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                        Password
                      </span>
                      <div className="relative">
                        <input
                          required
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerForm.password}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, password: event.target.value }))
                          }
                          placeholder="Minimum 6 characters"
                          className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 pr-14 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword((value) => !value)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-black"
                          aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                        >
                          {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                        Repeat password
                      </span>
                      <div className="relative">
                        <input
                          required
                          type={showRegisterConfirmPassword ? "text" : "password"}
                          value={registerForm.confirmPassword}
                          onChange={(event) =>
                            setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                          }
                          placeholder="Repeat password"
                          className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 pr-14 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterConfirmPassword((value) => !value)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-black"
                          aria-label={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                  </div>

                  <Button type="submit" fullWidth className="mt-2 min-h-14 rounded-[1.6rem]" disabled={isPending}>
                    {isPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              ) : (
                <form
                  className="mt-8 max-w-xl space-y-5"
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
                  <label className="block">
                    <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                      Phone number
                    </span>
                    <input
                      required
                      value={loginForm.phone}
                      onChange={(event) => setLoginForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="+998 90 123 45 67"
                      className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                      Password
                    </span>
                    <div className="relative">
                      <input
                        required
                        type={showLoginPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Enter your password"
                        className="min-h-14 w-full rounded-[1.6rem] border border-black/10 bg-zinc-50 px-5 pr-14 text-base text-black outline-none transition focus:border-black/25 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-black"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                  <Button type="submit" fullWidth className="min-h-14 rounded-[1.6rem]" disabled={isPending}>
                    {isPending ? "Signing in..." : "Login"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
