"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";

import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import { getProducts } from "@/lib/product-service";
import type { Product, ProductFilters } from "@/lib/types";

const initialFilters: ProductFilters = {
  sizes: [],
  colors: [],
  priceRange: [0, 200],
  sort: "newest",
  category: "All",
  cardType: "All"
};

export function ShopPageView() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products]
  );
  const cardTypes = useMemo(
    () => Array.from(new Set(products.map((product) => product.cardType))).filter(Boolean),
    [products]
  );
  const [filters, setFilters] = useState<ProductFilters>({
    ...initialFilters,
    category: categoryFromQuery ?? "All"
  });
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const entries = await getProducts();
        if (active) setProducts(entries);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.colors))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const filtered = products
      .filter((product) => filters.category === "All" || product.category === filters.category)
      .filter((product) => filters.cardType === "All" || product.cardType === filters.cardType)
      .filter(
        (product) =>
          (!filters.sizes.length || product.sizes.some((size) => filters.sizes.includes(size))) &&
          (!filters.colors.length || product.colors.some((color) => filters.colors.includes(color))) &&
          product.price >= filters.priceRange[0] &&
          product.price <= filters.priceRange[1]
      );

    return filtered.sort((left, right) => {
      if (filters.sort === "price-low") return left.price - right.price;
      if (filters.sort === "price-high") return right.price - left.price;
      return left.createdAt < right.createdAt ? 1 : -1;
    });
  }, [filters, products]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section className="editorial-card overflow-hidden rounded-[2.6rem] border border-black/5 px-6 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeading
            eyebrow="Shop"
            title="Quiet luxury, cut for mobile conversion."
            description="Browse by category, size, color, or price without losing the editorial tone of the brand."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["2-4 columns", "Responsive product density"],
              ["Quick add", "Faster than messenger ordering"],
              ["Wishlist", "Low-friction save behavior"]
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
              onClick={() => setFilters((current) => ({ ...current, category }))}
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
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Result set</p>
              <p className="mt-2 text-lg text-black">{filteredProducts.length} pieces ready to shop</p>
            </div>
            <p className="text-sm text-zinc-500">Hover on desktop to swap images and quick-add</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-3">
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
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">No products yet</p>
                  <p className="mt-4 text-base leading-7 text-zinc-600">
                    Add cards from the admin panel and they will appear here from the Node and Mongo backend.
                  </p>
                </div>
              )}

              {visibleProducts.length < filteredProducts.length ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-8 flex justify-center"
                >
                  <Button variant="secondary" onClick={() => setVisibleCount((count) => count + 4)}>
                    Load more
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
