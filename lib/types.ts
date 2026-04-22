export type ProductSize = "S" | "M" | "L" | "XL";

export type AppUserRole = "customer" | "admin";

export type AppUser = {
  id: string;
  email: string;
  role: AppUserRole;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  sizes: ProductSize[];
  colors: string[];
  description: string;
  category: string;
  cardType: string;
  tags: string[];
  featured?: boolean;
  isNewDrop?: boolean;
  rating?: number;
  sortPriority?: number;
  createdAt: string;
  updatedAt?: string;
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
  userId?: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartLine[];
  totalPrice: number;
  status?: "new" | "confirmed" | "shipped" | "delivered";
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
  cardType: string;
};

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

export type CustomerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role?: AppUserRole;
  createdAt: string;
  lastLoginAt?: string | null;
};
