"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { useToast } from "@/hooks/useToast";
import { addReview } from "@/lib/review-service";

export function ReviewForm({
  productId,
  onCreated
}: {
  productId: string;
  onCreated: () => Promise<void> | void;
}) {
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
          pushToast({ title: "Review published", tone: "success" });
          await onCreated();
        } catch (error) {
          pushToast({
            title: "Could not publish review",
            description: error instanceof Error ? error.message : "Please try again.",
            tone: "error"
          });
        } finally {
          setIsPending(false);
        }
      }}
    >
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Write a review</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Your name"
          className="min-h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/30"
        />
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="min-h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/30"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} Stars
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="How did it fit, feel, and arrive?"
        required
        rows={4}
        className="mt-4 w-full rounded-[1.6rem] border border-black/10 bg-white px-4 py-4 text-sm outline-none transition focus:border-black/30"
      />
      <Button type="submit" className="mt-4" disabled={isPending}>
        {isPending ? "Sending..." : "Submit review"}
      </Button>
    </form>
  );
}
