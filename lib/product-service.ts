import { apiRequest, resolveAssetUrl } from "@/lib/api-client";
import type { Product } from "@/lib/types";

function normalizeProduct(data: Partial<Product> & { id?: string; _id?: string }): Product {
  return {
    id: data.id ?? data._id ?? "",
    title: data.title ?? "Untitled Card",
    slug: data.slug ?? "",
    price: data.price ?? 0,
    images: (data.images ?? []).map((entry) => resolveAssetUrl(entry)),
    sizes: data.sizes ?? ["M"],
    colors: data.colors ?? ["#111111"],
    description: data.description ?? "",
    category: data.category ?? "T-shirts",
    cardType: data.cardType ?? "standard",
    tags: data.tags ?? [],
    featured: data.featured ?? false,
    isNewDrop: data.isNewDrop ?? false,
    rating: data.rating ?? 0,
    sortPriority: data.sortPriority ?? 0,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    updatedAt: data.updatedAt
  };
}

export async function getProducts() {
  const products = await apiRequest<Array<Partial<Product> & { id?: string; _id?: string }>>("/cards");
  return products.map((entry) => normalizeProduct(entry));
}

export async function getProductById(id: string) {
  try {
    const product = await apiRequest<Partial<Product> & { id?: string; _id?: string }>(`/cards/${id}`);
    return normalizeProduct(product);
  } catch {
    return null;
  }
}

export async function getRelatedProducts(productId: string) {
  const products = await getProducts();
  const current = products.find((product) => product.id === productId || product.slug === productId);
  if (!current) return products.slice(0, 4);

  return products.filter((product) => product.id !== current.id && product.category === current.category).slice(0, 4);
}

export async function createProduct(input: Omit<Product, "id" | "slug" | "createdAt">) {
  const created = await apiRequest<Partial<Product> & { id?: string; _id?: string }>("/cards", {
    method: "POST",
    body: input
  });

  return normalizeProduct(created);
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  const updated = await apiRequest<Partial<Product> & { id?: string; _id?: string }>(`/cards/${productId}`, {
    method: "PUT",
    body: updates
  });

  return normalizeProduct(updated);
}

export async function deleteProduct(productId: string) {
  await apiRequest(`/cards/${productId}`, {
    method: "DELETE"
  });
}

export async function uploadProductImages(files: File[], productId: string) {
  if (!files.length) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await apiRequest<{ images: string[] }>(`/cards/${productId}/images`, {
    method: "POST",
    body: formData
  });

  return response.images.map((entry) => resolveAssetUrl(entry));
}
