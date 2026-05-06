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
import { useT } from "@/hooks/useT";
import { getProducts } from "@/lib/product-service";
import type { Product } from "@/lib/types";
import { shouldBypassImageOptimization } from "@/lib/utils";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const t = useT();

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
          eyebrow={t.home.categoriesEyebrow}
          title={t.home.categoriesTitle}
          description={t.home.categoriesDesc}
        />

        {!isLoading && errorMessage ? (
          <div className="mt-6 rounded-[1.8rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="min-w-[78vw] sm:min-w-[320px] lg:min-w-90">
                  <SkeletonBlock className="aspect-4/5 w-full rounded-[2.2rem]" />
                </div>
              ))
            : categories.map(({ category, image }) => (
            <motion.div
              key={category}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="min-w-[78vw] snap-center sm:min-w-[320px] lg:min-w-90"
            >
              <Link href={`/shop?category=${encodeURIComponent(category)}`} className="block">
                <article className="relative aspect-4/5 overflow-hidden rounded-[2.2rem]">
                  {image ? (
                    <Image
                      src={image}
                      alt={category}
                      fill
                      sizes="(max-width: 768px) 78vw, 360px"
                      className="object-cover transition duration-700 hover:scale-105"
                      unoptimized={shouldBypassImageOptimization(image)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-200" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-6 bottom-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">{t.home.categoryLabel}</p>
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
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredTitle}
            description={t.home.featuredDesc}
          />
          <Link href="/shop">
            <Button variant="ghost" className="border border-black/10">
              {t.home.viewAll}
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <SkeletonBlock className="aspect-4/5 w-full rounded-4xl" />
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{t.home.noFeatured}</p>
              <p className="mt-4 text-base leading-7 text-zinc-600">{t.home.noFeaturedDesc}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-20 overflow-hidden rounded-[2.6rem] bg-black px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">{t.home.brandEyebrow}</p>
            <h2 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">
              {t.home.brandTitle}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70">
              {t.home.brandDesc}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.home.featureLabels.map((feature) => (
              <div key={feature} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">{t.home.featureLabel}</p>
                <p className="mt-3 text-lg text-white">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={t.home.newDropEyebrow}
            title={t.home.newDropTitle}
            description={t.home.newDropDesc}
          />
          <Link href="/shop">
            <Button>{t.home.shopNewDrop}</Button>
          </Link>
        </div>
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <SkeletonBlock className="aspect-4/5 w-full rounded-4xl" />
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : newDropProducts.length ? (
            <ProductGrid products={newDropProducts} />
          ) : (
            <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{t.home.noNewDrop}</p>
              <p className="mt-4 text-base leading-7 text-zinc-600">{t.home.noNewDropDesc}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
