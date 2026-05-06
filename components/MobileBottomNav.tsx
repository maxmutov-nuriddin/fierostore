"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Shield, ShoppingBag, User2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const { itemCount } = useCart();
  const t = useT();

  const items = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/shop", label: t.nav.shop, icon: Search },
    { href: "/cart", label: t.cart.eyebrow, icon: ShoppingBag },
    { href: "/account", label: t.account.profileTab, icon: User2 },
    { href: "/admin", label: t.nav.admin, icon: Shield }
  ];

  const visibleItems = items.filter((item) => item.href !== "/admin" || isAdmin);

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 rounded-full border border-black/10 bg-white/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
      <div className={`grid gap-1 ${visibleItems.length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition",
                pathname === item.href && "bg-black text-white"
              )}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.href === "/cart" && itemCount > 0 ? (
                <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] text-black">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
