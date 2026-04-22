import Link from "next/link";

import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.38em] text-zinc-500">404</p>
      <h1 className="mt-4 font-serif text-5xl text-black sm:text-6xl">This piece is no longer on the rack.</h1>
      <p className="mt-5 text-base leading-7 text-zinc-600">
        The page you are looking for does not exist or was moved to a new collection.
      </p>
      <Link href="/shop" className="mt-8">
        <Button>Return to shop</Button>
      </Link>
    </div>
  );
}
