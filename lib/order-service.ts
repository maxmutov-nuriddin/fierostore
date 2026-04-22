import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

import { db, isFirebaseConfigured, shouldUseLocalFallback } from "@/lib/firebase";
import type { CartLine, Order } from "@/lib/types";

export async function getOrders() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return snapshot.docs.map((entry) => ({
      id: entry.id,
      ...(entry.data() as Omit<Order, "id">),
      createdAt: entry.data().createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString()
    }));
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      return [];
    }

    throw error;
  }
}

export async function createOrder(input: {
  userId?: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartLine[];
  totalPrice: number;
  status?: Order["status"];
}) {
  const order: Order = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `order-${Date.now()}`,
    ...input,
    status: input.status ?? "new",
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  try {
    const created = await addDoc(collection(db, "orders"), order);
    return { ...order, id: created.id };
  } catch (error) {
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: NonNullable<Order["status"]>) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  try {
    await updateDoc(doc(db, "orders", orderId), { status });
    const orders = await getOrders();
    return orders.find((order) => order.id === orderId) ?? null;
  } catch (error) {
    throw error;
  }
}
