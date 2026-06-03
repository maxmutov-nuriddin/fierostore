import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { getProductById } from "@/lib/product-service";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

type ProductRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product not found",
      description: "This product is no longer available. Browse the latest FIERO collection instead.",
      robots: { index: false, follow: true }
    };
  }

  const canonical = `/product/${product.id}`;
  const cleanDescription =
    (product.description || siteConfig.description).replace(/\s+/g, " ").trim().slice(0, 200);
  const images = product.images.filter(Boolean).slice(0, 4);

  return {
    title: product.title,
    description: cleanDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${product.title} — FIERO`,
      description: cleanDescription,
      url: absoluteUrl(canonical),
      siteName: siteConfig.fullName,
      images: images.length ? images.map((url) => ({ url })) : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — FIERO`,
      description: cleanDescription,
      images: images.length ? images : undefined
    }
  };
}

export default async function ProductPage({ params }: ProductRouteProps) {
  const { id } = await params;
  const product = await getProductById(id);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: (product.description || siteConfig.description).replace(/\s+/g, " ").trim(),
        image: product.images.filter(Boolean),
        sku: product.id,
        category: product.category,
        brand: {
          "@type": "Brand",
          name: siteConfig.name
        },
        ...(product.rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                bestRating: 5,
                ratingCount: 1
              }
            }
          : {}),
        offers: {
          "@type": "Offer",
          url: absoluteUrl(`/product/${product.id}`),
          priceCurrency: "USD",
          price: product.price,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": absoluteUrl("/#organization") }
        }
      }
    : null;

  const breadcrumbJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
          {
            "@type": "ListItem",
            position: 3,
            name: product.title,
            item: absoluteUrl(`/product/${product.id}`)
          }
        ]
      }
    : null;

  return (
    <>
      {productJsonLd && breadcrumbJsonLd ? <JsonLd data={[productJsonLd, breadcrumbJsonLd]} /> : null}
      <ProductDetailPage productId={id} />
    </>
  );
}
