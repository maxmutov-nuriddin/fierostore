export type ProductSize = "S" | "M" | "L" | "XL";

export type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  sizes: ProductSize[];
  colors: string[];
  description: string;
  category: "T-shirts" | "Sets" | "Pants" | "Jackets";
  featured?: boolean;
  isNewDrop?: boolean;
  rating?: number;
  createdAt: string;
};

export type CartLine = {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  size: ProductSize;
  color: string;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartLine[];
  totalPrice: number;
  createdAt: string;
};

export type Review = {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
};

export type ProductFilters = {
  sizes: ProductSize[];
  colors: string[];
  priceRange: [number, number];
  sort: "newest" | "price-low" | "price-high";
  category: string;
};

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};
