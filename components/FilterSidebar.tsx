"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/Button";
import { useT } from "@/hooks/useT";
import type { ProductFilters, ProductSize } from "@/lib/types";
import { cn } from "@/lib/utils";

const sizes: ProductSize[] = ["S", "M", "L", "XL"];

export function FilterSidebar({
  availableColors,
  availableCardTypes,
  filters,
  onChange
}: {
  availableColors: string[];
  availableCardTypes: string[];
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}) {
  const t = useT();
  const update = (changes: Partial<ProductFilters>) => onChange({ ...filters, ...changes });

  return (
    <aside className="rounded-[2rem] border border-black/5 bg-white/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{t.filters.title}</p>
          <h3 className="mt-2 text-2xl font-medium text-black">{t.filters.subtitle}</h3>
        </div>
        <SlidersHorizontal className="text-zinc-500" size={18} />
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.filters.size}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = filters.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    update({ sizes: active ? filters.sizes.filter((v) => v !== size) : [...filters.sizes, size] })
                  }
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.25em] transition",
                    active ? "border-black bg-black text-white" : "border-black/10 text-zinc-600 hover:border-black/20"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.filters.cardType}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["All", ...availableCardTypes].map((cardType) => {
              const active = filters.cardType === cardType;
              return (
                <button
                  key={cardType}
                  type="button"
                  onClick={() => update({ cardType })}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.25em] transition",
                    active ? "border-black bg-black text-white" : "border-black/10 text-zinc-600 hover:border-black/20"
                  )}
                >
                  {cardType}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.filters.color}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {availableColors.map((color) => {
              const active = filters.colors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    update({ colors: active ? filters.colors.filter((v) => v !== color) : [...filters.colors, color] })
                  }
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition",
                    active ? "scale-105 border-black" : "border-black/10 hover:border-black/20"
                  )}
                >
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.filters.priceRange}</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-600">{t.filters.min}: ${filters.priceRange[0]}</span>
              <input
                type="range" min={0} max={200} step={5}
                value={filters.priceRange[0]}
                onChange={(e) =>
                  update({ priceRange: [Math.min(Number(e.target.value), filters.priceRange[1] - 5), filters.priceRange[1]] })
                }
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-600">{t.filters.max}: ${filters.priceRange[1]}</span>
              <input
                type="range" min={0} max={200} step={5}
                value={filters.priceRange[1]}
                onChange={(e) =>
                  update({ priceRange: [filters.priceRange[0], Math.max(Number(e.target.value), filters.priceRange[0] + 5)] })
                }
                className="w-full"
              />
            </label>
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.filters.sorting}</p>
          <div className="mt-4 space-y-2">
            {[
              { label: t.filters.newest, value: "newest" },
              { label: t.filters.priceLow, value: "price-low" },
              { label: t.filters.priceHigh, value: "price-high" }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ sort: option.value as ProductFilters["sort"] })}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition",
                  filters.sort === option.value
                    ? "border-black bg-black text-white"
                    : "border-black/10 text-zinc-600 hover:border-black/20"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <Button
        variant="ghost"
        fullWidth
        className="mt-8 border border-black/10"
        onClick={() => onChange({ sizes: [], colors: [], priceRange: [0, 200], sort: "newest", category: "All", cardType: "All" })}
      >
        {t.filters.reset}
      </Button>
    </aside>
  );
}
