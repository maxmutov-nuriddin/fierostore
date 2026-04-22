import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db, isFirebaseConfigured, shouldUseLocalFallback } from "@/lib/firebase";
import type { Review } from "@/lib/types";

export async function getReviewsByProduct(productId: string) {
  if (!isFirebaseConfigured || !db) {
    return [];
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
      return [];
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
    throw new Error("Firebase is not configured.");
  }

  try {
    const created = await addDoc(collection(db, "reviews"), review);
    return { ...review, id: created.id };
  } catch (error) {
    throw error;
  }
}
