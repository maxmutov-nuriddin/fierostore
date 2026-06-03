"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingBag, User2 } from "lucide-react";

import { FieroLogo } from "@/components/FieroLogo";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/hooks/useT";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/context/LanguageContext";
import type { Lang } from "@/lib/translations";
import { cn } from "@/lib/utils";

const LANGS: { id: Lang; label: string }[] = [
  { id: "uz", label: "UZ" },
  { id: "ru", label: "RU" },
  { id: "en", label: "EN" }
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, profile, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { lang, setLang } = useLanguage();
  const t = useT();

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/shop", label: t.nav.shop },
    { href: "/admin", label: t.nav.admin }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(248,246,243,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Fiero — home">
          <FieroLogo className="text-black" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.href === "/admin" && !isAdmin ? null : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-xs uppercase tracking-[0.3em] text-zinc-500 transition hover:text-black",
                  pathname === item.href && "text-black"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="hidden items-center rounded-full border border-black/10 p-0.5 sm:flex">
            {LANGS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLang(id)}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition",
                  lang === id
                    ? "bg-black text-white"
                    : "text-zinc-400 hover:text-zinc-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Link
            href="/account"
            className="hidden rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-600 transition hover:border-black/20 hover:text-black sm:inline-flex"
          >
            {isAuthenticated ? profile?.firstName || t.nav.login : t.nav.login}
          </Link>
          <Link
            href="/shop"
            className="hidden rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-600 transition hover:border-black/20 hover:text-black lg:inline-flex"
          >
            {t.nav.newDrop}
          </Link>
          <Link
            href={isAuthenticated ? "/shop" : "/account"}
            className="relative rounded-full border border-black/10 p-3 text-zinc-700 transition hover:border-black/20 hover:text-black"
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {ids.length > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                {ids.length}
              </span>
            ) : null}
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full border border-black/10 p-3 text-zinc-700 transition hover:border-black/20 hover:text-black"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-black/10 p-3 text-zinc-700 transition hover:border-black/20 hover:text-black sm:hidden"
            aria-label="Account"
          >
            <User2 size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
