"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { useT } from "@/hooks/useT";
import { useToast } from "@/hooks/useToast";
import { addReview } from "@/lib/review-service";

export function ReviewForm({ productId, onCreated }: { productId: string; onCreated: () => Promise<void> | void }) {
  const t = useT();
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { pushToast } = useToast();

  return (
    <form
      className="rounded-[2rem] border border-black/5 bg-white/80 p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsPending(true);
        try {
          await addReview({ productId, author: author || "Anonymous", rating, comment });
          setAuthor("");
          setRating(5);
          setComment("");
          pushToast({ title: t.review.published, tone: "success" });
          await onCreated();
        } catch (error) {
          pushToast({
            title: t.review.failed,
            description: error instanceof Error ? error.message : undefined,
            tone: "error"
          });
        } finally {
          setIsPending(false);
        }
      }}
    >
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{t.review.writeReview}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={t.review.yourName}
          className="min-h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/30"
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="min-h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/30"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} {t.review.stars}</option>
          ))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t.review.placeholder}
        required
        rows={4}
        className="mt-4 w-full rounded-[1.6rem] border border-black/10 bg-white px-4 py-4 text-sm outline-none transition focus:border-black/30"
      />
      <Button type="submit" className="mt-4" disabled={isPending}>
        {isPending ? t.review.submitting : t.review.submit}
      </Button>
    </form>
  );
}
