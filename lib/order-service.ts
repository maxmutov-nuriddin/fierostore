import { apiRequest } from "@/lib/api-client";
import type { CartLine, Order } from "@/lib/types";

export async function getOrders() {
  return apiRequest<Order[]>("/orders");
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
  return apiRequest<Order>("/orders", {
    method: "POST",
    body: {
      ...input,
      status: input.status ?? "new"
    }
  });
}

export async function updateOrderStatus(orderId: string, status: NonNullable<Order["status"]>) {
  return apiRequest<Order>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status }
  });
}
