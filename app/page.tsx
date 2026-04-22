"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import { getProducts } from "@/lib/product-service";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);

      try {
        const entries = await getProducts();
        if (active) {
          setProducts(entries);
          setErrorMessage("");
        }
      } catch (error) {
        if (active) {
          setProducts([]);
          setErrorMessage(error instanceof Error ? error.message : "Products could not be loaded.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).map((category) => ({
        category,
        image: products.find((product) => product.category === category)?.images[0] ?? ""
      })),
    [products]
  );

  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const newDropProducts = products.filter((product) => product.isNewDrop).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <HeroSection />

      <section className="mt-16">
        <SectionHeading
          eyebrow="Categories"
          title="Swipe the wardrobe by silhouette."
          description="A fast mobile-first category rail with strong editorial framing and instant intent."
        />

        {!isLoading && errorMessage ? (
          <div className="mt-6 rounded-[1.8rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="min-w-[78vw] sm:min-w-[320px] lg:min-w-[360px]">
                  <SkeletonBlock className="aspect-[4/5] w-full rounded-[2.2rem]" />
                </div>
              ))
            : categories.map(({ category, image }) => (
            <motion.div
              key={category}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="min-w-[78vw] snap-center sm:min-w-[320px] lg:min-w-[360px]"
            >
              <Link href={`/shop?category=${encodeURIComponent(category)}`} className="block">
                <article className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem]">
                  {image ? (
                    <Image
                      src={image}
                      alt={category}
                      fill
                      sizes="(max-width: 768px) 78vw, 360px"
                      className="object-cover transition duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-6 bottom-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">Category</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <h3 className="font-serif text-4xl text-white">{category}</h3>
                      <span className="rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Featured"
            title="Sharp essentials with premium calm."
            description="Core products with clean cuts, quiet branding, and conversion-first product cards."
          />
          <Link href="/shop">
            <Button variant="ghost" className="border border-black/10">
              View all
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <SkeletonBlock className="aspect-[4/5] w-full rounded-[2rem]" />
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">No featured products</p>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                Mark products as featured in the admin panel to show them here.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-20 overflow-hidden rounded-[2.6rem] bg-black px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Brand note</p>
            <h2 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">
              Built for 10-second buying, not endless browsing.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70">
              Sticky actions, quick-add behavior, friction-light checkout, and premium motion give the storefront the
              feel of a modern brand site instead of a noisy catalog.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Mobile-first layout",
              "Sticky add to cart",
              "Skeleton loading",
              "Node and Mongo admin flow"
            ].map((feature) => (
              <div key={feature} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Feature</p>
                <p className="mt-3 text-lg text-white">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="New drop"
            title="Recent additions with a cinematic feel."
            description="The latest drop is merchandised for immediate decision making across mobile and desktop."
          />
          <Link href="/shop">
            <Button>Shop new drop</Button>
          </Link>
        </div>
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <SkeletonBlock className="aspect-[4/5] w-full rounded-[2rem]" />
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : newDropProducts.length ? (
            <ProductGrid products={newDropProducts} />
          ) : (
            <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">No new drop yet</p>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                Upload new products in the admin panel and mark them as a new drop.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
