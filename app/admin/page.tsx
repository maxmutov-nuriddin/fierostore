"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Eye, ImagePlus, Package, Pencil, Phone, Search,
  ShoppingBag, Sparkles, Star, Trash2, TrendingUp,
  CheckCircle2, Clock, Send, Truck, X
} from "lucide-react";

import { Button } from "@/components/Button";
import { FieroLogo } from "@/components/FieroLogo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  createProduct, deleteProduct, getProducts,
  updateProduct, uploadProductImages
} from "@/lib/product-service";
import { getOrders, updateOrderStatus } from "@/lib/order-service";
import type { Order, Product } from "@/lib/types";
import { formatCurrency, shouldBypassImageOptimization } from "@/lib/utils";

const CATEGORIES = ["Dresses", "Tops", "Sets", "Outerwear", "Knitwear", "Bottoms"];
const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered"] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

type ProductForm = {
  title: string; price: string; category: Product["category"];
  cardType: string; description: string; sizes: string;
  colors: string; tags: string; featured: boolean;
  isNewDrop: boolean; rating: string; sortPriority: string;
};

const initialForm: ProductForm = {
  title: "", price: "", category: "Dresses", cardType: "standard",
  description: "", sizes: "S,M,L,XL", colors: "#111111,#e7e5e4",
  tags: "new,signature", featured: false, isNewDrop: true,
  rating: "4.8", sortPriority: "0"
};

const STATUS_META: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new:       { label: "Yangi",     color: "bg-zinc-100 text-zinc-700 border-zinc-200",           icon: <Clock size={12} /> },
  confirmed: { label: "Tasdiqlandi", color: "bg-blue-50 text-blue-700 border-blue-200",          icon: <CheckCircle2 size={12} /> },
  shipped:   { label: "Yo'lda",    color: "bg-amber-50 text-amber-700 border-amber-200",         icon: <Truck size={12} /> },
  delivered: { label: "Yetkazildi", color: "bg-emerald-50 text-emerald-700 border-emerald-200",  icon: <CheckCircle2 size={12} /> }
};

// ── Helper: labeled form field ───────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">{label}</p>
        {hint ? <p className="text-[10px] text-zinc-400">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

// ── Helper: section card ────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-black/5 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// ── Base input class ────────────────────────────────────────────────────────
const inputCls = "min-h-12 w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 text-sm outline-none transition hover:border-black/20 focus:border-black/30 focus:bg-white";
const selectCls = inputCls + " cursor-pointer appearance-none";

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, logout } = useAuth();
  const { pushToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadedAdminData, setHasLoadedAdminData] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [view, setView] = useState<"products" | "orders">("products");

  useEffect(() => {
    if (!files.length) { setFilePreviews([]); return; }
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [files]);

  async function refresh() {
    const [p, o] = await Promise.all([getProducts(), getOrders()]);
    setProducts(p); setOrders(o);
  }

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    async function load() {
      try {
        const [p, o] = await Promise.all([getProducts(), getOrders()]);
        if (!active) return;
        setProducts(p); setOrders(o);
      } finally {
        if (active) setHasLoadedAdminData(true);
      }
    }
    void load();
    return () => { active = false; };
  }, [isAdmin]);

  const stats = useMemo(() => ({
    productCount: products.length,
    orderCount: orders.length,
    newOrders: orders.filter((o) => (o.status ?? "new") === "new").length,
    revenue: orders.reduce((s, o) => s + o.totalPrice, 0)
  }), [orders, products.length]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.title, p.category, p.cardType, ...p.tags].join(" ").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const orderStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const s of ORDER_STATUSES) counts[s] = orders.filter((o) => (o.status ?? "new") === s).length;
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "all" || (o.status ?? "new") === orderStatusFilter;
      const matchQuery = !q || [o.customerName, o.phone, o.address].join(" ").toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading || (isAdmin && !hasLoadedAdminData)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-black" />
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">Ma'lumotlar yuklanmoqda…</p>
        </div>
      </div>
    );
  }

  // ── Access denied ────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-10">
        <Card className="p-8 text-center sm:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <Package size={28} className="text-zinc-500" />
          </div>
          <h1 className="mt-6 font-serif text-4xl text-black sm:text-5xl">
            {isAuthenticated ? "Ruxsat yo'q" : "Tizimga kiring"}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-zinc-500">
            {isAuthenticated
              ? "Sizning hisobingizda admin huquqlari yo'q. Admin raqamingiz va paroli bilan kiring."
              : "Admin paneliga kirish uchun admin telefon raqami va parolini kiriting."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/account">
              <Button>{isAuthenticated ? "Hisobni almashtirish" : "Kirish sahifasi"}</Button>
            </Link>
            {isAuthenticated ? (
              <Button variant="secondary" onClick={async () => { await logout(); pushToast({ title: "Tizimdan chiqildi", tone: "info" }); }}>
                Chiqish
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }

  // ── Form submit ──────────────────────────────────────────────────────────
  async function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean) as Product["sizes"];
      const colors = form.colors.split(",").map((s) => s.trim()).filter(Boolean);
      const tags = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = {
        title: form.title, price: Number(form.price), category: form.category,
        cardType: form.cardType, description: form.description,
        sizes, colors, tags, featured: form.featured,
        isNewDrop: form.isNewDrop, rating: Number(form.rating),
        sortPriority: Number(form.sortPriority)
      };

      if (editingId) {
        if (files.length) await uploadProductImages(files, editingId);
        await updateProduct(editingId, payload);
      } else {
        const created = await createProduct({ ...payload, images: [] });
        if (files.length) await uploadProductImages(files, created.id);
      }

      await refresh();
      setEditingId(null); setForm(initialForm); setFiles([]); setEditingImages([]);
      pushToast({ title: editingId ? "Mahsulot yangilandi" : "Mahsulot yaratildi", tone: "success" });
    } catch (error) {
      pushToast({ title: "Saqlashda xatolik", description: error instanceof Error ? error.message : "Qayta urinib ko'ring.", tone: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      title: p.title, price: String(p.price), category: p.category,
      cardType: p.cardType, description: p.description,
      sizes: p.sizes.join(","), colors: p.colors.join(","),
      tags: p.tags.join(","), featured: Boolean(p.featured),
      isNewDrop: Boolean(p.isNewDrop), rating: String(p.rating ?? 4.8),
      sortPriority: String(p.sortPriority ?? 0)
    });
    setFiles([]); setEditingImages(p.images); setView("products");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null); setForm(initialForm); setFiles([]); setEditingImages([]);
  }

  // ── Main admin UI ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-10">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
            <FieroLogo markOnly className="scale-90" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-zinc-400">Admin panel</p>
            <h1 className="text-xl font-medium text-black sm:text-2xl">Boshqaruv markazi</h1>
          </div>
        </div>
        <Button
          variant="secondary"
          className="gap-2 px-4 text-xs"
          onClick={async () => { await logout(); router.push("/"); }}
        >
          <X size={14} /> Chiqish
        </Button>
      </header>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          {
            label: "Mahsulotlar", value: stats.productCount,
            sub: "katalogda", icon: <Package size={18} />, style: "bg-white border-black/5 text-black"
          },
          {
            label: "Buyurtmalar", value: stats.orderCount,
            sub: "jami qabul", icon: <ShoppingBag size={18} />, style: "bg-white border-black/5 text-black"
          },
          {
            label: "Yangi buyurtma", value: stats.newOrders,
            sub: "ko'rib chiqish kerak", icon: <Clock size={18} />, style: "bg-amber-50 border-amber-100 text-amber-900"
          },
          {
            label: "Daromad", value: formatCurrency(stats.revenue),
            sub: "jami savdo", icon: <TrendingUp size={18} />, style: "bg-black border-black text-white"
          }
        ].map(({ label, value, sub, icon, style }) => (
          <div key={label} className={`rounded-2xl border p-4 sm:rounded-3xl sm:p-5 ${style}`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.26em] opacity-60 sm:text-xs">{label}</p>
              <span className="opacity-40">{icon}</span>
            </div>
            <p className="mt-3 truncate text-2xl font-medium sm:text-3xl">{value}</p>
            <p className="mt-1 text-[10px] opacity-50 sm:text-xs">{sub}</p>
          </div>
        ))}
      </section>

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="mt-6 inline-flex rounded-2xl border border-black/8 bg-zinc-50 p-1 gap-1">
        {([
          ["products", "Mahsulotlar", stats.productCount, <Package size={14} key="p" />],
          ["orders", "Buyurtmalar", stats.orderCount, <ShoppingBag size={14} key="o" />]
        ] as const).map(([key, label, count, icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs uppercase tracking-[0.22em] transition ${
              view === key
                ? "bg-black text-white shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            {icon}
            {label}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${view === key ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-500"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PRODUCTS VIEW
      ════════════════════════════════════════════════════════════════ */}
      {view === "products" ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr]">

          {/* ── Product form ─────────────────────────────────────────── */}
          <Card className="overflow-hidden">
            {/* Form header */}
            <div className={`flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6 ${editingId ? "bg-amber-50" : "bg-zinc-50"}`}>
              <div>
                <p className={`text-[10px] uppercase tracking-[0.32em] ${editingId ? "text-amber-600" : "text-zinc-400"}`}>
                  {editingId ? "Tahrirlash rejimi" : "Yangi mahsulot"}
                </p>
                <p className="mt-0.5 text-base font-medium text-black">
                  {editingId ? "Mahsulotni yangilash" : "Mahsulot yaratish"}
                </p>
              </div>
              {editingId ? (
                <button type="button" onClick={cancelEdit}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-500 transition hover:border-black/20 hover:text-black">
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 p-5 sm:p-6">

              {/* Section: Asosiy */}
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-zinc-400">① Asosiy ma'lumotlar</p>

                <Field label="Mahsulot nomi" hint="majburiy">
                  <input required value={form.title}
                    onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                    placeholder="Masalan: Silk Blend Midi Dress"
                    className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Narxi (so'm)" hint="raqam">
                    <input required type="number" min="0" step="1" value={form.price}
                      onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                      placeholder="150000"
                      className={inputCls} />
                  </Field>
                  <Field label="Kategoriya">
                    <select value={form.category}
                      onChange={(e) => setForm((c) => ({ ...c, category: e.target.value as Product["category"] }))}
                      className={selectCls}>
                      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Tavsif" hint="majburiy">
                  <textarea required rows={3} value={form.description}
                    onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                    placeholder="Mahsulot haqida qisqa tavsif yozing…"
                    className="w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none transition hover:border-black/20 focus:border-black/30 focus:bg-white" />
                </Field>
              </div>

              <hr className="border-black/5" />

              {/* Section: Variantlar */}
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-zinc-400">② O'lchamlar va ranglar</p>

                <Field label="O'lchamlar" hint="vergul bilan ajrating">
                  <input value={form.sizes}
                    onChange={(e) => setForm((c) => ({ ...c, sizes: e.target.value }))}
                    placeholder="S,M,L,XL"
                    className={inputCls} />
                </Field>

                <Field label="Ranglar (HEX kodlar)" hint="vergul bilan">
                  <input value={form.colors}
                    onChange={(e) => setForm((c) => ({ ...c, colors: e.target.value }))}
                    placeholder="#111111,#e7e5e4,#d4b896"
                    className={inputCls} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.colors.split(",").map((c) => c.trim()).filter((c) => /^#[0-9a-fA-F]{3,6}$/.test(c)).map((c) => (
                      <span key={c} title={c} className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Karta turi">
                    <input value={form.cardType}
                      onChange={(e) => setForm((c) => ({ ...c, cardType: e.target.value }))}
                      placeholder="standard, editorial…"
                      className={inputCls} />
                  </Field>
                  <Field label="Teglar" hint="vergul bilan">
                    <input value={form.tags}
                      onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))}
                      placeholder="new,limited,summer"
                      className={inputCls} />
                  </Field>
                </div>
              </div>

              <hr className="border-black/5" />

              {/* Section: Rasmlar */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-zinc-400">③ Rasmlar</p>

                {/* Current images (edit mode) */}
                {editingId && editingImages.length ? (
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-zinc-400">Hozirgi rasmlar</p>
                    <div className="flex flex-wrap gap-2">
                      {editingImages.map((src) => (
                        <span key={src} className="relative h-16 w-14 overflow-hidden rounded-xl border border-black/8 bg-zinc-100">
                          <Image src={src} alt="Mahsulot rasmi" fill sizes="56px" className="object-cover"
                            unoptimized={shouldBypassImageOptimization(src)} />
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* File upload zone */}
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-zinc-50 px-4 py-6 text-center transition hover:border-black/20 hover:bg-zinc-100">
                  <ImagePlus size={22} className="text-zinc-400" />
                  <span className="text-xs text-zinc-500">
                    {editingId ? "Yangi rasmlar qo'shish (hozirgilarga qo'shiladi)" : "Rasmlarni tanlash"}
                  </span>
                  <span className="text-[10px] text-zinc-400">JPEG, PNG, WebP · maks 5 MB</span>
                  <input multiple type="file" accept="image/*" className="sr-only"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
                </label>

                {/* New file previews */}
                {filePreviews.length ? (
                  <div className="flex flex-wrap gap-2">
                    {filePreviews.map((src, i) => (
                      <span key={src} className="relative h-16 w-14 overflow-hidden rounded-xl border-2 border-emerald-300 bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Yangi ${i + 1}`} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 py-0.5 text-center text-[8px] text-white">yangi</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <hr className="border-black/5" />

              {/* Section: Sozlamalar */}
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-zinc-400">④ Sozlamalar</p>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Reyting" hint="0 – 5">
                    <input type="number" min="0" max="5" step="0.1" value={form.rating}
                      onChange={(e) => setForm((c) => ({ ...c, rating: e.target.value }))}
                      className={inputCls} />
                  </Field>
                  <Field label="Saralash tartibi" hint="katta = yuqori">
                    <input value={form.sortPriority}
                      onChange={(e) => setForm((c) => ({ ...c, sortPriority: e.target.value }))}
                      placeholder="0"
                      className={inputCls} />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/8 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 transition hover:border-black/15">
                    <input type="checkbox" checked={form.featured}
                      onChange={(e) => setForm((c) => ({ ...c, featured: e.target.checked }))}
                      className="h-4 w-4 rounded accent-black" />
                    <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-zinc-400" /> Tavsiya etiladi</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/8 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 transition hover:border-black/15">
                    <input type="checkbox" checked={form.isNewDrop}
                      onChange={(e) => setForm((c) => ({ ...c, isNewDrop: e.target.checked }))}
                      className="h-4 w-4 rounded accent-black" />
                    <span className="flex items-center gap-1.5"><Star size={14} className="text-zinc-400" /> Yangi to'plam</span>
                  </label>
                </div>
              </div>

              <Button type="submit" fullWidth disabled={isSaving} className="mt-2">
                {isSaving
                  ? (editingId ? "Yangilanmoqda…" : "Yaratilmoqda…")
                  : (editingId ? "Mahsulotni yangilash" : "Mahsulot yaratish")}
              </Button>
            </form>
          </Card>

          {/* ── Product list ──────────────────────────────────────────── */}
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Katalog</p>
                <p className="mt-0.5 text-base font-medium text-black">
                  Mahsulotlar
                  <span className="ml-2 text-sm font-normal text-zinc-400">({filteredProducts.length} ta)</span>
                </p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Qidirish…"
                  className="min-h-10 w-full rounded-xl border border-black/10 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition focus:border-black/25 focus:bg-white" />
              </div>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 px-5 py-14 text-center">
                  <Package size={28} className="mx-auto text-zinc-300" />
                  <p className="mt-3 text-sm text-zinc-400">
                    {products.length === 0 ? "Hali mahsulot yo'q. Birinchisini yarating." : "Qidiruv bo'yicha mahsulot topilmadi."}
                  </p>
                </div>
              ) : null}

              {filteredProducts.map((product) => (
                <article key={product.id} className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-zinc-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-zinc-200">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill sizes="64px" className="object-cover"
                          unoptimized={shouldBypassImageOptimization(product.images[0])} />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImagePlus size={18} className="text-zinc-400" />
                        </div>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">{product.category}</p>
                      <h3 className="mt-0.5 truncate text-base font-medium text-black">{product.title}</h3>
                      <p className="mt-0.5 text-sm font-medium text-zinc-700">{formatCurrency(product.price)}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white">
                            <Sparkles size={9} /> Tavsiya
                          </span>
                        ) : null}
                        {product.isNewDrop ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-700">Yangi</span>
                        ) : null}
                        {product.rating ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                            <Star size={9} className="fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <Link href={`/product/${product.id}`} target="_blank"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-zinc-600 transition hover:border-black/20 hover:text-black"
                      title="Mahsulotni ko'rish">
                      <Eye size={15} />
                    </Link>
                    <button type="button" title="Tahrirlash"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-zinc-600 transition hover:border-black/20 hover:text-black"
                      onClick={() => startEdit(product)}>
                      <Pencil size={15} />
                    </button>
                    <button type="button" title="O'chirish"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
                      onClick={async () => {
                        try {
                          await deleteProduct(product.id);
                          await refresh();
                          pushToast({ title: "Mahsulot o'chirildi", tone: "info" });
                        } catch (error) {
                          pushToast({ title: "O'chirishda xatolik", description: error instanceof Error ? error.message : undefined, tone: "error" });
                        }
                      }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {/* ════════════════════════════════════════════════════════════════
          ORDERS VIEW
      ════════════════════════════════════════════════════════════════ */}
      {view === "orders" ? (
        <Card className="mt-5 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Buyurtmalar</p>
              <p className="mt-0.5 text-base font-medium text-black">
                Barcha buyurtmalar
                <span className="ml-2 text-sm font-normal text-zinc-400">({filteredOrders.length} ta)</span>
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Ism yoki telefon bo'yicha qidirish…"
                className="min-h-10 w-full rounded-xl border border-black/10 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition focus:border-black/25 focus:bg-white" />
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 border-b border-black/5 px-5 py-3 sm:px-6">
            {(["all", ...ORDER_STATUSES] as const).map((s) => {
              const active = orderStatusFilter === s;
              const meta = s !== "all" ? STATUS_META[s] : null;
              return (
                <button key={s} type="button" onClick={() => setOrderStatusFilter(s)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs transition ${
                    active ? "border-black bg-black text-white" : "border-black/10 bg-white text-zinc-600 hover:border-black/20"
                  }`}>
                  {meta?.icon ?? null}
                  {s === "all" ? "Barchasi" : meta?.label ?? s}
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-zinc-100 text-zinc-500"}`}>
                    {orderStatusCounts[s] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 px-5 py-14 text-center lg:col-span-2">
                <ShoppingBag size={28} className="mx-auto text-zinc-300" />
                <p className="mt-3 text-sm text-zinc-400">
                  {orders.length === 0 ? "Hali buyurtmalar yo'q." : "Bu filtr bo'yicha buyurtma topilmadi."}
                </p>
              </div>
            ) : null}

            {filteredOrders.map((order) => {
              const status = (order.status ?? "new") as OrderStatus;
              const meta = STATUS_META[status];
              const tgPhone = order.phone.replace(/\D/g, "");
              const date = new Date(order.createdAt).toLocaleString("ru-RU", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
              });

              return (
                <article key={order.id} className="flex flex-col rounded-2xl border border-black/5 bg-white">
                  {/* Order header */}
                  <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-[10px] text-zinc-400">{date}</span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-4">
                    {/* Customer */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Xaridor</p>
                        <p className="mt-1 text-base font-medium text-black">{order.customerName}</p>
                        <p className="mt-0.5 text-sm text-zinc-500">{order.address}</p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-2">
                      <a href={`tel:${order.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-zinc-50 px-3.5 py-2 text-xs font-medium text-black transition hover:bg-zinc-100">
                        <Phone size={13} /> {order.phone}
                      </a>
                      {tgPhone ? (
                        <a href={`https://t.me/+${tgPhone}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-medium text-sky-700 transition hover:bg-sky-100">
                          <Send size={13} /> Telegram
                        </a>
                      ) : null}
                    </div>

                    {/* Items */}
                    <div className="rounded-xl border border-black/5 bg-zinc-50">
                      <div className="border-b border-black/5 px-3.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                          {order.items.length} ta mahsulot
                        </p>
                      </div>
                      <div className="space-y-2 p-3.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 text-zinc-700">
                              <span className="truncate">{item.title}</span>
                              <span className="ml-1.5 text-xs text-zinc-400">· {item.size} · ×{item.quantity}</span>
                            </span>
                            <span className="shrink-0 font-medium text-black">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-black/5 px-3.5 py-2.5">
                        <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Jami</span>
                        <span className="text-base font-semibold text-black">{formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Status update — pill buttons */}
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.26em] text-zinc-400">Statusni yangilash</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ORDER_STATUSES.map((s) => {
                          const m = STATUS_META[s];
                          const isActive = status === s;
                          return (
                            <button key={s} type="button"
                              disabled={isActive}
                              onClick={async () => {
                                try {
                                  await updateOrderStatus(order.id, s);
                                  await refresh();
                                  pushToast({ title: "Status yangilandi", tone: "success" });
                                } catch (error) {
                                  pushToast({ title: "Xatolik yuz berdi", description: error instanceof Error ? error.message : undefined, tone: "error" });
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] transition ${
                                isActive
                                  ? `${m.color} cursor-default font-semibold`
                                  : "border-black/10 bg-white text-zinc-500 hover:border-black/20 hover:text-black"
                              }`}>
                              {m.icon} {m.label}
                              {isActive ? <CheckCircle2 size={11} className="ml-0.5" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
