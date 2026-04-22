import type { Order, Product, Review } from "@/lib/types";

export const categoryLabels = ["T-shirts", "Sets", "Pants", "Jackets"] as const;

export const sampleProducts: Product[] = [
  {
    id: "p1",
    slug: "atelier-oversized-tee",
    title: "Atelier Oversized Tee",
    price: 34,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["#111111", "#d9d4cf"],
    description: "Heavyweight cotton tee with a clean shoulder drop and a soft washed hand feel.",
    category: "T-shirts",
    featured: true,
    isNewDrop: true,
    rating: 4.8,
    createdAt: "2026-04-17T10:00:00.000Z"
  },
  {
    id: "p2",
    slug: "signature-knit-set",
    title: "Signature Knit Set",
    price: 86,
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#6b6258", "#f3f1ec"],
    description: "Relaxed knit shirt and short pairing designed for fast styling and premium lounge comfort.",
    category: "Sets",
    featured: true,
    isNewDrop: true,
    rating: 4.9,
    createdAt: "2026-04-18T12:15:00.000Z"
  },
  {
    id: "p3",
    slug: "contour-tailored-pants",
    title: "Contour Tailored Pants",
    price: 62,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["#171717", "#9b9488"],
    description: "Straight-leg pants with a clean hem, hidden waistband structure, and day-to-night drape.",
    category: "Pants",
    featured: true,
    rating: 4.7,
    createdAt: "2026-04-12T09:30:00.000Z"
  },
  {
    id: "p4",
    slug: "layered-bomber-jacket",
    title: "Layered Bomber Jacket",
    price: 118,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["#0b0b0b", "#57534e"],
    description: "Boxy bomber with matte hardware, quilted lining, and a subtle fashion volume.",
    category: "Jackets",
    featured: true,
    isNewDrop: true,
    rating: 5,
    createdAt: "2026-04-20T15:00:00.000Z"
  },
  {
    id: "p5",
    slug: "studio-box-tee",
    title: "Studio Box Tee",
    price: 29,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#e7e5e4", "#111827"],
    description: "Everyday box-fit tee with a wide collar and minimal stitching detail.",
    category: "T-shirts",
    rating: 4.6,
    createdAt: "2026-04-08T16:45:00.000Z"
  },
  {
    id: "p6",
    slug: "uniform-utility-set",
    title: "Uniform Utility Set",
    price: 94,
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465406325903-9d93ee82f613?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["#27272a", "#c4b8a5"],
    description: "Structured overshirt and tailored short set with tonal buttons and clean front pockets.",
    category: "Sets",
    rating: 4.7,
    createdAt: "2026-04-05T11:20:00.000Z"
  },
  {
    id: "p7",
    slug: "drape-wide-leg-trouser",
    title: "Drape Wide-Leg Trouser",
    price: 68,
    images: [
      "https://images.unsplash.com/photo-1506629905607-45c443f69587?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#1f2937", "#e5ddd3"],
    description: "Full-length trouser with fluid volume and a clean waistband finish.",
    category: "Pants",
    rating: 4.9,
    createdAt: "2026-04-02T14:10:00.000Z"
  },
  {
    id: "p8",
    slug: "transit-shell-jacket",
    title: "Transit Shell Jacket",
    price: 132,
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["#111111", "#b8b2aa"],
    description: "Lightweight shell with sculpted sleeves, storm flap details, and subtle water resistance.",
    category: "Jackets",
    rating: 4.8,
    createdAt: "2026-03-30T08:00:00.000Z"
  }
];

export const sampleReviews: Review[] = [
  {
    id: "r1",
    productId: "p1",
    rating: 5,
    comment: "Perfect oversized fit and the fabric feels much more premium than expected.",
    author: "Amina",
    createdAt: "2026-04-18T08:20:00.000Z"
  },
  {
    id: "r2",
    productId: "p1",
    rating: 4,
    comment: "Very clean cut. Shipping took 9 days and the quality was worth the wait.",
    author: "Bekzod",
    createdAt: "2026-04-19T13:12:00.000Z"
  },
  {
    id: "r3",
    productId: "p4",
    rating: 5,
    comment: "Looks editorial in person. The silhouette is exactly what I wanted.",
    author: "Madina",
    createdAt: "2026-04-21T09:05:00.000Z"
  }
];

export const sampleOrders: Order[] = [
  {
    id: "ord-1001",
    customerName: "Dilshod Karimov",
    phone: "+998 90 111 22 33",
    address: "Tashkent, Mirzo-Ulugbek district, 12",
    items: [
      {
        id: "line-1",
        productId: "p4",
        title: "Layered Bomber Jacket",
        image: sampleProducts[3].images[0],
        price: 118,
        size: "L",
        color: "#0b0b0b",
        quantity: 1
      }
    ],
    totalPrice: 118,
    createdAt: "2026-04-21T10:30:00.000Z"
  }
];
