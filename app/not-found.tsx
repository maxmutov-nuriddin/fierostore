"use client";

import Link from "next/link";

import { Button } from "@/components/Button";
import { useT } from "@/hooks/useT";

export default function NotFound() {
  const t = useT();

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.38em] text-zinc-500">{t.notFound.label}</p>
      <h1 className="mt-4 font-serif text-5xl text-black sm:text-6xl">{t.notFound.title}</h1>
      <p className="mt-5 text-base leading-7 text-zinc-600">{t.notFound.desc}</p>
      <Link href="/shop" className="mt-8">
        <Button>{t.notFound.returnToShop}</Button>
      </Link>
    </div>
  );
}
