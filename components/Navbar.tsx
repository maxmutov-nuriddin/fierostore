"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/admin", label: "Admin" }
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { ids } = useWishlist();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(248,246,243,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="text-lg font-semibold uppercase tracking-[0.45em] text-black">
          FIERO
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
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
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="hidden rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-600 transition hover:border-black/20 hover:text-black sm:inline-flex"
          >
            New Drop
          </Link>
          <Link
            href="/shop"
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
        </div>
      </div>
    </header>
  );
}
