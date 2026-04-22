"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "light" | "invert";
  fullWidth?: boolean;
  iconLeft?: ReactNode;
};

export function Button({
  className,
  children,
  variant = "primary",
  fullWidth,
  iconLeft,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm uppercase tracking-[0.28em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-black text-white hover:bg-zinc-800",
        variant === "secondary" && "border border-black/10 bg-white text-black hover:border-black/20 hover:bg-zinc-100",
        variant === "ghost" && "bg-transparent text-black hover:bg-black/5",
        variant === "light" && "bg-white text-black hover:bg-zinc-200",
        variant === "invert" && "bg-white text-black hover:bg-zinc-800 hover:text-white",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {iconLeft}
      <span>{children}</span>
    </button>
  );
}
