"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  uploadProductImages
} from "@/lib/product-service";
import { getOrders, updateOrderStatus } from "@/lib/order-service";
import type { Order, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type ProductForm = {
  title: string;
  price: string;
  category: Product["category"];
  cardType: string;
  description: string;
  sizes: string;
  colors: string;
  tags: string;
  featured: boolean;
  isNewDrop: boolean;
  rating: string;
  sortPriority: string;
};

const initialForm: ProductForm = {
  title: "",
  price: "",
  category: "T-shirts",
  cardType: "standard",
  description: "",
  sizes: "S,M,L,XL",
  colors: "#111111,#e7e5e4",
  tags: "new,signature",
  featured: false,
  isNewDrop: true,
  rating: "4.8",
  sortPriority: "0"
};

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, loginAdmin, logout } = useAuth();
  const { pushToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadedAdminData, setHasLoadedAdminData] = useState(false);
  const [adminLogin, setAdminLogin] = useState({ email: "", password: "" });

  async function refresh() {
    const [productEntries, orderEntries] = await Promise.all([getProducts(), getOrders()]);
    setProducts(productEntries);
    setOrders(orderEntries);
  }

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;

    async function load() {
      try {
        const [productEntries, orderEntries] = await Promise.all([getProducts(), getOrders()]);
        if (!active) return;
        setProducts(productEntries);
        setOrders(orderEntries);
      } finally {
        if (active) setHasLoadedAdminData(true);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const stats = useMemo(
    () => ({
      productCount: products.length,
      orderCount: orders.length,
      revenue: orders.reduce((sum, order) => sum + order.totalPrice, 0)
    }),
    [orders, products.length]
  );

  if (isLoading || (isAdmin && !hasLoadedAdminData)) {
    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">Loading admin...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2.6rem] border border-black/5 bg-black px-6 py-10 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/55">Admin panel</p>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl">Manage products, orders, and the storefront.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
              Only admins can upload product cards, edit catalog data, and update order statuses.
            </p>
            {isAuthenticated ? (
              <Button variant="secondary" className="mt-8 border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={async () => logout()}>
                Logout current user
              </Button>
            ) : null}
          </section>

          <section className="rounded-[2.6rem] border border-black/5 bg-white/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Admin login</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();

                try {
                  await loginAdmin(adminLogin);
                  pushToast({ title: "Admin signed in", tone: "success" });
                  router.refresh();
                } catch (error) {
                  pushToast({
                    title: "Admin login failed",
                    description: error instanceof Error ? error.message : "Please check email and password.",
                    tone: "error"
                  });
                }
              }}
            >
              <input
                required
                value={adminLogin.email}
                onChange={(event) => setAdminLogin((current) => ({ ...current, email: event.target.value }))}
                placeholder="Admin email"
                className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <input
                required
                type="password"
                value={adminLogin.password}
                onChange={(event) => setAdminLogin((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <Button type="submit" fullWidth>
                Enter admin
              </Button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Admin"
          title="Premium control room for catalog and orders."
          description="Upload product cards, update merchandising, and process incoming orders from one protected dashboard."
        />
        <Button
          variant="ghost"
          className="border border-black/10"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          Logout
        </Button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Products</p>
          <p className="mt-3 text-3xl text-black">{stats.productCount}</p>
        </div>
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Orders</p>
          <p className="mt-3 text-3xl text-black">{stats.orderCount}</p>
        </div>
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Revenue</p>
          <p className="mt-3 text-3xl text-black">{formatCurrency(stats.revenue)}</p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <section className="rounded-[2.4rem] border border-black/5 bg-white/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {editingId ? "Edit product" : "Add product"}
              </p>
              <p className="mt-2 text-2xl text-black">{editingId ? "Update existing card" : "Create new card"}</p>
            </div>
            {editingId ? (
              <Button
                variant="ghost"
                className="border border-black/10"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                  setFiles([]);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSaving(true);

              try {
                const parsedSizes = form.sizes.split(",").map((entry) => entry.trim()).filter(Boolean) as Product["sizes"];
                const parsedColors = form.colors.split(",").map((entry) => entry.trim()).filter(Boolean);
                const parsedTags = form.tags.split(",").map((entry) => entry.trim()).filter(Boolean);

                if (editingId) {
                  if (files.length) {
                    await uploadProductImages(files, editingId);
                  }

                  await updateProduct(editingId, {
                    title: form.title,
                    price: Number(form.price),
                    category: form.category,
                    cardType: form.cardType,
                    description: form.description,
                    sizes: parsedSizes,
                    colors: parsedColors,
                    tags: parsedTags,
                    featured: form.featured,
                    isNewDrop: form.isNewDrop,
                    rating: Number(form.rating),
                    sortPriority: Number(form.sortPriority)
                  });
                } else {
                  const created = await createProduct({
                    title: form.title,
                    price: Number(form.price),
                    category: form.category,
                    cardType: form.cardType,
                    description: form.description,
                    sizes: parsedSizes,
                    colors: parsedColors,
                    tags: parsedTags,
                    featured: form.featured,
                    isNewDrop: form.isNewDrop,
                    rating: Number(form.rating),
                    sortPriority: Number(form.sortPriority),
                    images: []
                  });

                  if (files.length) {
                    await uploadProductImages(files, created.id);
                  }
                }

                await refresh();
                setEditingId(null);
                setForm(initialForm);
                setFiles([]);
                pushToast({ title: "Product saved", tone: "success" });
              } catch (error) {
                pushToast({
                  title: "Could not save product",
                  description: error instanceof Error ? error.message : "Please try again.",
                  tone: "error"
                });
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Product title"
              className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="Price"
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value as Product["category"] }))
                }
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              >
                {["T-shirts", "Sets", "Pants", "Jackets"].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                value={form.cardType}
                onChange={(event) => setForm((current) => ({ ...current, cardType: event.target.value }))}
                placeholder="Card type: standard, editorial..."
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <input
                value={form.sortPriority}
                onChange={(event) => setForm((current) => ({ ...current, sortPriority: event.target.value }))}
                placeholder="Sort priority"
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
            </div>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              className="w-full rounded-[1.8rem] border border-black/10 bg-white px-5 py-4 text-sm outline-none transition focus:border-black/25"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.sizes}
                onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))}
                placeholder="Sizes: S,M,L,XL"
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <input
                value={form.colors}
                onChange={(event) => setForm((current) => ({ ...current, colors: event.target.value }))}
                placeholder="Colors: #111111,#e7e5e4"
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
            </div>
            <input
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Tags: capsule,summer,limited"
              className="min-h-13 w-full rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                placeholder="Rating"
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 text-sm outline-none transition focus:border-black/25"
              />
              <input
                multiple
                type="file"
                accept="image/*"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                className="min-h-13 rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none transition focus:border-black/25"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={form.isNewDrop}
                  onChange={(event) => setForm((current) => ({ ...current, isNewDrop: event.target.checked }))}
                />
                New drop
              </label>
            </div>
            <Button type="submit" fullWidth disabled={isSaving}>
              {isSaving ? "Saving..." : editingId ? "Update product" : "Create product"}
            </Button>
          </form>
        </section>

        <div className="space-y-8">
          <section className="rounded-[2.4rem] border border-black/5 bg-white/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Catalog</p>
                <p className="mt-2 text-2xl text-black">Manage product cards</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <article key={product.id} className="rounded-[1.8rem] border border-black/5 bg-zinc-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        {product.category} / {product.cardType}
                      </p>
                      <h3 className="mt-2 text-xl text-black">{product.title}</h3>
                      <p className="mt-2 text-sm text-zinc-600">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        className="border border-black/10"
                        onClick={() => {
                          setEditingId(product.id);
                          setForm({
                            title: product.title,
                            price: String(product.price),
                            category: product.category,
                            cardType: product.cardType,
                            description: product.description,
                            sizes: product.sizes.join(","),
                            colors: product.colors.join(","),
                            tags: product.tags.join(","),
                            featured: Boolean(product.featured),
                            isNewDrop: Boolean(product.isNewDrop),
                            rating: String(product.rating ?? 4.8),
                            sortPriority: String(product.sortPriority ?? 0)
                          });
                          setFiles([]);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="border border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={async () => {
                          try {
                            await deleteProduct(product.id);
                            await refresh();
                            pushToast({ title: "Product deleted", tone: "info" });
                          } catch (error) {
                            pushToast({
                              title: "Delete failed",
                              description: error instanceof Error ? error.message : "Please try again.",
                              tone: "error"
                            });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2.4rem] border border-black/5 bg-white/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Orders</p>
              <p className="mt-2 text-2xl text-black">Track and update incoming orders</p>
            </div>
            <div className="mt-6 space-y-4">
              {orders.map((order) => {
                const statusColors: Record<NonNullable<Order["status"]>, string> = {
                  new: "bg-zinc-100 text-zinc-600",
                  confirmed: "bg-blue-50 text-blue-700",
                  shipped: "bg-amber-50 text-amber-700",
                  delivered: "bg-green-50 text-green-700"
                };
                const statusLabels: Record<NonNullable<Order["status"]>, string> = {
                  new: "New",
                  confirmed: "Confirmed",
                  shipped: "Shipped",
                  delivered: "Delivered"
                };
                const status = order.status ?? "new";
                const tgPhone = order.phone.replace(/\D/g, "");

                return (
                  <article key={order.id} className="rounded-[1.8rem] border border-black/5 bg-zinc-50 p-5">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${statusColors[status]}`}>
                        {statusLabels[status]}
                      </span>
                      <p className="text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>

                    {/* Customer info */}
                    <div className="mt-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">Customer</p>
                      <p className="mt-1.5 text-lg text-black">{order.customerName}</p>
                      <p className="mt-1 text-sm text-zinc-500">{order.address}</p>
                    </div>

                    {/* Contact buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`tel:${order.phone}`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs uppercase tracking-[0.24em] text-black transition hover:bg-zinc-100"
                      >
                        📞 {order.phone}
                      </a>
                      {tgPhone && (
                        <a
                          href={`https://t.me/+${tgPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 text-xs uppercase tracking-[0.24em] text-sky-700 transition hover:bg-sky-100"
                        >
                          Telegram
                        </a>
                      )}
                    </div>

                    {/* Items list */}
                    <div className="mt-4 rounded-[1.2rem] border border-black/5 bg-white p-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                      <div className="mt-3 space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="truncate text-zinc-700">
                              {item.title}
                              <span className="ml-1.5 text-zinc-400">
                                · {item.size} · ×{item.quantity}
                              </span>
                            </span>
                            <span className="ml-4 shrink-0 text-black">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                        <span className="text-xs uppercase tracking-[0.22em] text-zinc-400">Total</span>
                        <span className="text-base text-black">{formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Status update */}
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">Update status</p>
                      <select
                        value={status}
                        onChange={async (event) => {
                          try {
                            await updateOrderStatus(order.id, event.target.value as NonNullable<Order["status"]>);
                            await refresh();
                            pushToast({ title: "Order updated", tone: "success" });
                          } catch (error) {
                            pushToast({
                              title: "Could not update order",
                              description: error instanceof Error ? error.message : "Please try again.",
                              tone: "error"
                            });
                          }
                        }}
                        className="mt-2 min-h-11 rounded-full border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-black/25"
                      >
                        {["new", "confirmed", "shipped", "delivered"].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
