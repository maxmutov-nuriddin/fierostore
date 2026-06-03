import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Transactional / private routes should never be indexed.
        disallow: ["/cart", "/checkout", "/account", "/admin"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url
  };
}
