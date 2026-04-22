"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/Button";
import type { ProductFilters, ProductSize } from "@/lib/types";
import { cn } from "@/lib/utils";

const sizes: ProductSize[] = ["S", "M", "L", "XL"];

export function FilterSidebar({
  availableColors,
  filters,
  onChange
}: {
  availableColors: string[];
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}) {
  const update = (changes: Partial<ProductFilters>) => onChange({ ...filters, ...changes });

  return (
    <aside className="rounded-[2rem] border border-black/5 bg-white/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Filters</p>
          <h3 className="mt-2 text-2xl font-medium text-black">Refine the edit</h3>
        </div>
        <SlidersHorizontal className="text-zinc-500" size={18} />
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Size</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = filters.sizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    update({
                      sizes: active ? filters.sizes.filter((value) => value !== size) : [...filters.sizes, size]
                    })
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
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Color</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {availableColors.map((color) => {
              const active = filters.colors.includes(color);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    update({
                      colors: active
                        ? filters.colors.filter((value) => value !== color)
                        : [...filters.colors, color]
                    })
                  }
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition",
                    active ? "border-black scale-105" : "border-black/10 hover:border-black/20"
                  )}
                >
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Price range</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-600">Min: ${filters.priceRange[0]}</span>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.priceRange[0]}
                onChange={(event) =>
                  update({
                    priceRange: [
                      Math.min(Number(event.target.value), filters.priceRange[1] - 5),
                      filters.priceRange[1]
                    ]
                  })
                }
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-600">Max: ${filters.priceRange[1]}</span>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.priceRange[1]}
                onChange={(event) =>
                  update({
                    priceRange: [
                      filters.priceRange[0],
                      Math.max(Number(event.target.value), filters.priceRange[0] + 5)
                    ]
                  })
                }
                className="w-full"
              />
            </label>
          </div>
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Sorting</p>
          <div className="mt-4 space-y-2">
            {[
              { label: "Newest", value: "newest" },
              { label: "Price low to high", value: "price-low" },
              { label: "Price high to low", value: "price-high" }
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
        onClick={() =>
          onChange({
            sizes: [],
            colors: [],
            priceRange: [0, 200],
            sort: "newest",
            category: "All"
          })
        }
      >
        Reset filters
      </Button>
    </aside>
  );
}
