"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, Truck } from "lucide-react";

import { Button } from "@/components/Button";
import { ProductGrid } from "@/components/ProductGrid";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { SectionHeading } from "@/components/SectionHeading";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import { StickyAddToCartBar } from "@/components/StickyAddToCartBar";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductById, getRelatedProducts } from "@/lib/product-service";
import { getReviewsByProduct } from "@/lib/review-service";
import type { Product, ProductSize, Review } from "@/lib/types";
import { averageRating, formatCurrency } from "@/lib/utils";

export function ProductDetailPage({ productId }: { productId: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { pushToast } = useToast();
  const { toggle, isSaved } = useWishlist();

  const loadReviews = async (currentId: string) => {
    const items = await getReviewsByProduct(currentId);
    setReviews(items);
  };

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const [productEntry, relatedEntries] = await Promise.all([
          getProductById(productId),
          getRelatedProducts(productId)
        ]);

        if (!active) return;

        setProduct(productEntry);
        setRelated(relatedEntries);
        if (productEntry) {
          setSelectedSize(productEntry.sizes[0] ?? null);
          setSelectedColor(productEntry.colors[0] ?? null);
          await loadReviews(productEntry.id);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [productId]);

  const reviewScore = useMemo(() => averageRating(reviews.map((review) => review.rating)), [reviews]);

  const handleAdd = () => {
    if (!product || !selectedSize || !selectedColor) return;

    addItem(product, { size: selectedSize, color: selectedColor });
    pushToast({
      title: "Added to cart",
      description: `${product.title} in ${selectedSize}`,
      tone: "success"
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <SkeletonBlock className="aspect-[4/5] w-full rounded-[2.4rem]" />
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="h-14 w-3/4" />
            <SkeletonBlock className="h-5 w-1/4" />
            <SkeletonBlock className="h-24 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Missing product</p>
        <h1 className="mt-4 font-serif text-5xl text-black">This piece is currently unavailable.</h1>
        <Link href="/shop" className="mt-8">
          <Button>Back to shop</Button>
        </Link>
      </div>
    );
  }

  const saved = isSaved(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-2">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`relative aspect-[4/5] min-w-[82vw] overflow-hidden rounded-[2.2rem] sm:min-w-[46vw] lg:min-w-0 ${
                  activeImage === index ? "ring-2 ring-black/20" : ""
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.title} image ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 82vw, 40vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{product.category}</p>
          <h1 className="mt-4 font-serif text-5xl leading-none text-black sm:text-6xl">{product.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <p className="text-lg uppercase tracking-[0.2em] text-black">{formatCurrency(product.price)}</p>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Star size={15} className="fill-current text-black" />
              <span>{(reviewScore || product.rating || 4.8).toFixed(1)} rating</span>
            </div>
          </div>

          <p className="mt-6 text-base leading-7 text-zinc-600">{product.description}</p>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-4 py-3 text-xs uppercase tracking-[0.25em] transition ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-black/10 text-zinc-600 hover:border-black/20"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Color</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    selectedColor === color ? "border-black scale-105" : "border-black/10 hover:border-black/20"
                  }`}
                >
                  <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-black/5 bg-white/80 p-5">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 text-zinc-500" size={18} />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Delivery info</p>
                <p className="mt-2 text-base text-zinc-700">Ships in 7-18 days with order tracking.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button fullWidth onClick={handleAdd}>
              Add to cart
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                if (!isAuthenticated) {
                  pushToast({
                    title: "Login required",
                    description: "Sign in before placing an order.",
                    tone: "info"
                  });
                  router.push("/account");
                  return;
                }

                handleAdd();
                router.push("/checkout");
              }}
            >
              Buy now
            </Button>
            <Button
              variant="ghost"
              className={`border ${saved ? "border-black bg-black text-white hover:bg-zinc-800" : "border-black/10"}`}
              onClick={() => {
                if (!isAuthenticated) {
                  pushToast({
                    title: "Login required",
                    description: "Create an account to save products to wishlist.",
                    tone: "info"
                  });
                  router.push("/account");
                  return;
                }

                toggle(product.id);
                pushToast({
                  title: saved ? "Removed from wishlist" : "Saved to wishlist",
                  description: product.title
                });
              }}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="Reviews"
            title="What customers say after delivery."
            description="Minimal feedback system powered by Firestore and linked to the product record."
          />
        </div>
        <div className="space-y-5">
          <ReviewForm productId={product.id} onCreated={() => loadReviews(product.id)} />
          <ReviewList reviews={reviews} />
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading
          eyebrow="You may also like"
          title="More pieces from the same mood."
          description="Related items keep the shopping path moving without breaking the premium aesthetic."
        />
        <div className="mt-8">
          <ProductGrid products={related} />
        </div>
      </section>

      {selectedSize && selectedColor ? (
        <StickyAddToCartBar product={product} size={selectedSize} color={selectedColor} onAdd={handleAdd} />
      ) : null}
    </div>
  );
}
