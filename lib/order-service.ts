import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

import { db, isFirebaseConfigured, shouldUseLocalFallback } from "@/lib/firebase";
import { sampleOrders } from "@/lib/sample-data";
import type { CartLine, Order } from "@/lib/types";

const STORAGE_KEY = "fierostore.orders";

function getLocalOrders() {
  if (typeof window === "undefined") {
    return sampleOrders;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return sampleOrders;

  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return sampleOrders;
  }
}

function setLocalOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export async function getOrders() {
  if (!isFirebaseConfigured || !db) {
    return getLocalOrders().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
      return getLocalOrders().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
    setLocalOrders([order, ...getLocalOrders()]);
    return order;
  }

  try {
    const created = await addDoc(collection(db, "orders"), order);
    return { ...order, id: created.id };
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      setLocalOrders([order, ...getLocalOrders()]);
      return order;
    }

    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: NonNullable<Order["status"]>) {
  if (!isFirebaseConfigured || !db) {
    const orders = getLocalOrders().map((order) => (order.id === orderId ? { ...order, status } : order));
    setLocalOrders(orders);
    return orders.find((order) => order.id === orderId) ?? null;
  }

  try {
    await updateDoc(doc(db, "orders", orderId), { status });
    const orders = await getOrders();
    return orders.find((order) => order.id === orderId) ?? null;
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      const orders = getLocalOrders().map((order) => (order.id === orderId ? { ...order, status } : order));
      setLocalOrders(orders);
      return orders.find((order) => order.id === orderId) ?? null;
    }

    throw error;
  }
}
