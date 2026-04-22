import { apiRequest } from "@/lib/api-client";
import type { Review } from "@/lib/types";

export async function getReviewsByProduct(productId: string) {
  const reviews = await apiRequest<
    Array<{
      id: string;
      cardId: string;
      rating: number;
      comment: string;
      author: string;
      createdAt: string;
    }>
  >(`/reviews?cardId=${encodeURIComponent(productId)}`);

  return reviews.map((entry) => ({
    id: entry.id,
    productId: entry.cardId,
    rating: entry.rating,
    comment: entry.comment,
    author: entry.author,
    createdAt: entry.createdAt
  }));
}

export async function addReview(input: Omit<Review, "id" | "createdAt">) {
  const created = await apiRequest<{
    id: string;
    cardId: string;
    rating: number;
    comment: string;
    author: string;
    createdAt: string;
  }>("/reviews", {
    method: "POST",
    body: {
      cardId: input.productId,
      author: input.author,
      rating: input.rating,
      comment: input.comment
    }
  });

  return {
    id: created.id,
    productId: created.cardId,
    rating: created.rating,
    comment: created.comment,
    author: created.author,
    createdAt: created.createdAt
  };
}
