"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

type Mode = "login" | "register";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, login, logout, profile, register } = useAuth();
  const { pushToast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [isPending, setIsPending] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
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
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className="flex flex-col justify-between gap-8 overflow-hidden rounded-[2.6rem] bg-ink px-7 py-9 text-white sm:px-9">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-white/45">Fiero account</p>
              <h1 className="mt-5 font-serif text-5xl leading-[0.93] sm:text-6xl">{displayName || "Welcome back"}</h1>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
                Your wishlist, order history, and checkout details are all saved here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="light" onClick={() => router.push("/shop")}>
                Continue shopping
              </Button>
              <Button
                variant="ghost"
                className="border border-white/15 text-white hover:bg-white/8"
                onClick={() => router.push("/checkout")}
              >
                Checkout
              </Button>
            </div>
          </section>

          <aside className="rounded-[2.6rem] border border-black/5 bg-white/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-400">Profile details</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
      <div className="grid min-h-[78svh] gap-5 lg:grid-cols-[0.72fr_1.28fr]">

        {/* Brand panel */}
        <section className="relative flex flex-col justify-between overflow-hidden rounded-[2.6rem] bg-ink px-7 py-9 text-white sm:px-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.07),transparent_55%)]" />
          <div className="pointer-events-none absolute bottom-0 right-0 font-serif text-[12rem] leading-none text-white/[0.035] select-none">
            F
          </div>

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
                "Faster checkout on every return"
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

          {/* Tab toggle */}
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
  value,
  onChange,
  show,
  onToggle,
  placeholder
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
