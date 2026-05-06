"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";

import { Button } from "@/components/Button";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import { useT } from "@/hooks/useT";
import { getProducts } from "@/lib/product-service";
import type { Product, ProductFilters } from "@/lib/types";

const initialFilters: ProductFilters = {
  sizes: [], colors: [], priceRange: [0, 200], sort: "newest", category: "All", cardType: "All"
};

export function ShopPageView() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get("category");
  const t = useT();

  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({
    ...initialFilters, category: categoryFromQuery ?? "All"
  });
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getProducts()
      .then((entries) => { if (active) { setProducts(entries); setErrorMessage(""); } })
      .catch((error) => { if (active) { setProducts([]); setErrorMessage(error instanceof Error ? error.message : t.shop.error); } })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const cardTypes = useMemo(() => Array.from(new Set(products.map((p) => p.cardType))).filter(Boolean), [products]);
  const availableColors = useMemo(() => Array.from(new Set(products.flatMap((p) => p.colors))), [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products
      .filter((p) => filters.category === "All" || p.category === filters.category)
      .filter((p) => filters.cardType === "All" || p.cardType === filters.cardType)
      .filter((p) =>
        (!filters.sizes.length || p.sizes.some((s) => filters.sizes.includes(s))) &&
        (!filters.colors.length || p.colors.some((c) => filters.colors.includes(c))) &&
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    return filtered.sort((a, b) => {
      if (filters.sort === "price-low") return a.price - b.price;
      if (filters.sort === "price-high") return b.price - a.price;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [filters, products]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section className="editorial-card overflow-hidden rounded-[2.6rem] border border-black/5 px-6 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeading eyebrow={t.shop.eyebrow} title={t.shop.title} description={t.shop.desc} />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [t.shop.feature1Title, t.shop.feature1Desc],
              [t.shop.feature2Title, t.shop.feature2Desc],
              [t.shop.feature3Title, t.shop.feature3Desc]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.8rem] border border-black/5 bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-700">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 flex snap-x gap-3 overflow-x-auto pb-2">
        {["All", ...categories].map((category) => {
          const active = filters.category === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilters((c) => ({ ...c, category }))}
              className={`snap-start rounded-full border px-5 py-3 text-xs uppercase tracking-[0.28em] transition ${
                active ? "border-black bg-black text-white" : "border-black/10 text-zinc-600 hover:border-black/20"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
        <FilterSidebar
          availableColors={availableColors}
          availableCardTypes={cardTypes}
          filters={filters}
          onChange={setFilters}
        />

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{t.shop.resultSet}</p>
              <p className="mt-2 text-lg text-black">{filteredProducts.length} {t.shop.pieces}</p>
            </div>
            <p className="text-sm text-zinc-500">{t.shop.hoverHint}</p>
          </div>

          {!isLoading && errorMessage ? (
            <div className="mb-5 rounded-[1.8rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <SkeletonBlock className="aspect-[4/5] w-full rounded-[2rem]" />
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {visibleProducts.length ? (
                <ProductGrid products={visibleProducts} />
              ) : (
                <div className="rounded-[2.4rem] border border-dashed border-black/10 px-6 py-16 text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{t.shop.noProducts}</p>
                  <p className="mt-4 text-base leading-7 text-zinc-600">{t.shop.noProductsDesc}</p>
                </div>
              )}

              {visibleProducts.length < filteredProducts.length ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-8 flex justify-center"
                >
                  <Button variant="secondary" onClick={() => setVisibleCount((c) => c + 4)}>
                    {t.shop.loadMore}
                  </Button>
                </motion.div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
