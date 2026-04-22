"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Shield, ShoppingBag } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/admin", label: "Admin", icon: Shield }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 rounded-full border border-black/10 bg-white/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
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
