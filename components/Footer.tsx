"use client";

import { useT } from "@/hooks/useT";

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-black/5 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="text-lg font-semibold uppercase tracking-[0.45em] text-black">FIERO</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">{t.footer.desc}</p>
        </div>
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.footer.delivery}</div>
      </div>
    </footer>
  );
}
