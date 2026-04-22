import { Star } from "lucide-react";

import type { Review } from "@/lib/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-black/10 px-6 py-12 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">No reviews yet</p>
        <p className="mt-3 text-zinc-600">Be the first to leave feedback on this piece.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-[2rem] border border-black/5 bg-white/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">{review.author}</p>
              <div className="mt-2 flex items-center gap-1 text-black">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={`${review.id}-${index}`} size={14} className={index < review.rating ? "fill-current" : ""} />
                ))}
              </div>
            </div>
            <p className="text-sm text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
          <p className="mt-4 text-base leading-7 text-zinc-700">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}
