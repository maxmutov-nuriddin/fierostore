"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

import { Button } from "@/components/Button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2.4rem] border border-black/5 bg-black text-white">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80"
          alt="Premium fashion editorial hero"
          fill
          priority
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/15" />
      </div>

      <div className="relative mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-end px-5 py-10 sm:px-6 lg:px-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.42em] text-white/65">New season uniform</p>
          <h1 className="mt-5 font-serif text-5xl leading-[0.92] sm:text-7xl lg:text-[7rem]">
            Silent luxury made wearable.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
            Minimal silhouettes, clean layers, and a fast mobile checkout built to replace your Telegram store.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button variant="light">Shop the drop</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
