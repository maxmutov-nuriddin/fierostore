import type { MetadataRoute } from "next";

import { getProducts } from "@/lib/product-service";
import { absoluteUrl } from "@/lib/site-config";

// Revalidate the sitemap hourly so new products appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    }
  ];

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const products = await getProducts();
    productRoutes = products.map((product) => ({
      // Internal links route by id, so the canonical product URL is /product/{id}.
      url: absoluteUrl(`/product/${product.id}`),
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(product.createdAt),
      changeFrequency: "weekly",
      priority: 0.8
    }));
  } catch {
    // Backend unreachable at build/request time — ship the static routes only.
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}
