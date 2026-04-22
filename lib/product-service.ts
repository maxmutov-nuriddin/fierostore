import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";

import { db, isFirebaseConfigured, shouldUseLocalFallback, uploadImage } from "@/lib/firebase";
import { sampleProducts } from "@/lib/sample-data";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "fierostore.products";

function generateId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `product-${Date.now()}`;
}

function buildSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getLocalProducts() {
  if (typeof window === "undefined") {
    return sampleProducts;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return sampleProducts;

  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return sampleProducts;
  }
}

function setLocalProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function normalizeProduct(
  id: string,
  data: Partial<Product> & {
    createdAt?: { toDate?: () => Date } | string | Date | null;
  }
): Product {
  const createdAt =
    typeof data.createdAt === "string"
      ? data.createdAt
      : data.createdAt instanceof Date
        ? data.createdAt.toISOString()
        : data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString();

  return {
    id,
    title: data.title ?? "Untitled Product",
    slug: data.slug ?? buildSlug(data.title ?? id),
    price: data.price ?? 0,
    images: data.images ?? [],
    sizes: data.sizes ?? ["M"],
    colors: data.colors ?? ["#111111"],
    description: data.description ?? "",
    category: data.category ?? "T-shirts",
    featured: data.featured ?? false,
    isNewDrop: data.isNewDrop ?? false,
    rating: data.rating ?? 0,
    createdAt
  };
}

export async function getProducts() {
  if (!isFirebaseConfigured || !db) {
    return getLocalProducts().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  try {
    const snapshot = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    return snapshot.docs.map((entry) => normalizeProduct(entry.id, entry.data() as Product));
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      return getLocalProducts().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }

    throw error;
  }
}

export async function getProductById(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id === id || product.slug === id) ?? null;
}

export async function getRelatedProducts(productId: string) {
  const products = await getProducts();
  const current = products.find((product) => product.id === productId || product.slug === productId);
  if (!current) return products.slice(0, 4);

  return products.filter((product) => product.id !== current.id && product.category === current.category).slice(0, 4);
}

export async function createProduct(input: Omit<Product, "id" | "slug" | "createdAt">) {
  const product: Product = {
    ...input,
    id: generateId(),
    slug: buildSlug(input.title),
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured || !db) {
    const products = [product, ...getLocalProducts()];
    setLocalProducts(products);
    return product;
  }

  try {
    const created = await addDoc(collection(db, "products"), product);
    return { ...product, id: created.id };
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      const products = [product, ...getLocalProducts()];
      setLocalProducts(products);
      return product;
    }

    throw error;
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  if (!isFirebaseConfigured || !db) {
    const products = getLocalProducts().map((product) =>
      product.id === productId
        ? {
            ...product,
            ...updates,
            slug: updates.title ? buildSlug(updates.title) : product.slug
          }
        : product
    );
    setLocalProducts(products);
    return products.find((product) => product.id === productId) ?? null;
  }

  try {
    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    return updated.exists() ? normalizeProduct(updated.id, updated.data() as Product) : null;
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      const products = getLocalProducts().map((product) =>
        product.id === productId
          ? {
              ...product,
              ...updates,
              slug: updates.title ? buildSlug(updates.title) : product.slug
            }
          : product
      );
      setLocalProducts(products);
      return products.find((product) => product.id === productId) ?? null;
    }

    throw error;
  }
}

export async function deleteProduct(productId: string) {
  if (!isFirebaseConfigured || !db) {
    setLocalProducts(getLocalProducts().filter((product) => product.id !== productId));
    return;
  }

  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    if (shouldUseLocalFallback(error)) {
      setLocalProducts(getLocalProducts().filter((product) => product.id !== productId));
      return;
    }

    throw error;
  }
}

export async function uploadProductImages(files: File[], productId: string) {
  if (!files.length) return [];

  const urls = await Promise.all(
    files.map((file, index) => uploadImage(file, `products/${productId}/${index + 1}-${file.name}`))
  );

  return urls;
}
