"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Heart, ShoppingBag, Star } from "lucide-react";

import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/lib/types";
import { cn, formatCurrency, shouldBypassImageOptimization } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const { pushToast } = useToast();

  const saved = isSaved(product.id);
  const cardImage = hovered ? product.images[1] ?? product.images[0] : product.images[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-zinc-200">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden">
            {cardImage ? (
              <Image
                src={cardImage}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                unoptimized={shouldBypassImageOptimization(cardImage)}
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-200" />
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              pushToast({
                title: "Login required",
                description: "Create an account to save products to wishlist.",
                tone: "info"
              });
              router.push("/account");
              return;
            }

            toggle(product.id);
            pushToast({
              title: saved ? "Removed from wishlist" : "Saved to wishlist",
              description: product.title,
              tone: "info"
            });
          }}
          className={cn(
            "absolute right-4 top-4 rounded-full border border-white/20 bg-white/85 p-3 text-black shadow-sm backdrop-blur transition hover:bg-white",
            saved && "bg-black text-white hover:bg-zinc-800"
          )}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>

        <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            fullWidth
            variant="invert"
            iconLeft={<ShoppingBag size={16} />}
            onClick={() => {
              addItem(product);
              pushToast({
                title: "Added to cart",
                description: `${product.title} in ${product.sizes[0]}`,
                tone: "success"
              });
            }}
          >
            Quick add
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{product.category}</p>
          <Link href={`/product/${product.id}`} className="mt-2 block text-lg font-medium text-black">
            {product.title}
          </Link>
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <Star size={14} className="fill-current text-black" />
            <span>{(product.rating ?? 4.8).toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm uppercase tracking-[0.18em] text-black">{formatCurrency(product.price)}</p>
      </div>
    </motion.article>
  );
}
