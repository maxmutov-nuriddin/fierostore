import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { ShopPageView } from "@/components/ShopPageView";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shop — Dresses, Tops & New-Season Essentials",
  description:
    "Browse the full FIERO collection of premium women's wear. Filter by category, size, color, and price — quiet-luxury silhouettes and new drops, ready to shop.",
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    title: "Shop FIERO — Premium Women's Wear",
    description:
      "Browse curated dresses, tops, and layers. Quiet-luxury silhouettes with fast, friction-light checkout.",
    url: absoluteUrl("/shop"),
    siteName: siteConfig.fullName
  }
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteConfig.url
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Shop",
      item: absoluteUrl("/shop")
    }
  ]
};

export default function ShopPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ShopPageView />
    </>
  );
}
