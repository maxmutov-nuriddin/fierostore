"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { categoryLabels, sampleProducts } from "@/lib/sample-data";

const categoryImages = {
  "T-shirts": sampleProducts[0].images[0],
  Sets: sampleProducts[1].images[0],
  Pants: sampleProducts[2].images[0],
  Jackets: sampleProducts[3].images[0]
};

export default function HomePage() {
  const featuredProducts = sampleProducts.filter((product) => product.featured).slice(0, 4);
  const newDropProducts = sampleProducts.filter((product) => product.isNewDrop).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <HeroSection />

      <section className="mt-16">
        <SectionHeading
          eyebrow="Categories"
          title="Swipe the wardrobe by silhouette."
          description="A fast mobile-first category rail with strong editorial framing and instant intent."
        />

        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
          {categoryLabels.map((category) => (
            <motion.div
              key={category}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="min-w-[78vw] snap-center sm:min-w-[320px] lg:min-w-[360px]"
            >
              <Link href={`/shop?category=${encodeURIComponent(category)}`} className="block">
                <article className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem]">
                  <Image
                    src={categoryImages[category]}
                    alt={category}
                    fill
                    sizes="(max-width: 768px) 78vw, 360px"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
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
          <ProductGrid products={featuredProducts} />
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
              "Firebase admin flow"
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
          <ProductGrid products={newDropProducts} />
        </div>
      </section>
    </div>
  );
}
