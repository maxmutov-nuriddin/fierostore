import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function averageRating(values: number[]) {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function slugToTitle(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function shouldBypassImageOptimization(src: string) {
  if (!src) return false;

  if (src.startsWith("/uploads/")) {
    return true;
  }

  try {
    const url = new URL(src);
    return [url.hostname, url.port].join(":") === "localhost:5051" || [url.hostname, url.port].join(":") === "127.0.0.1:5051";
  } catch {
    return false;
  }
}
