import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db, isFirebaseConfigured, shouldUseLocalFallback } from "@/lib/firebase";
import { sampleReviews } from "@/lib/sample-data";
import type { Review } from "@/lib/types";

const STORAGE_KEY = "fierostore.reviews";

function getLocalReviews() {
  if (typeof window === "undefined") {
    return sampleReviews;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return sampleReviews;

  try {
    return JSON.parse(raw) as Review[];
  } catch {
    return sampleReviews;
  }
}

function setLocalReviews(reviews: Review[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export async function getReviewsByProduct(productId: string) {
  if (!isFirebaseConfigured || !db) {
    return getLocalReviews().filter((review) => review.productId === productId);
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((entry) => ({
      id: entry.id,
      ...(entry.data() as Omit<Review, "id">),
      createdAt: entry.data().createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString()
    }));
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      return getLocalReviews().filter((review) => review.productId === productId);
    }

    throw error;
  }
}

export async function addReview(input: Omit<Review, "id" | "createdAt">) {
  const review: Review = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `review-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured || !db) {
    setLocalReviews([review, ...getLocalReviews()]);
    return review;
  }

  try {
    const created = await addDoc(collection(db, "reviews"), review);
    return { ...review, id: created.id };
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      setLocalReviews([review, ...getLocalReviews()]);
      return review;
    }

    throw error;
  }
}
