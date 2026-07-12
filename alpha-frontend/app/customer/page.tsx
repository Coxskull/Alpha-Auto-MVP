"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

import { getProducts } from "@/services/products";
import { getSuppliers } from "@/services/suppliers";
import { addToCart } from "@/services/cart";
import ProductCard from "@/components/ProductCard";
import SupplierCard from "@/components/SupplierCard";
import VehicleSelector from "@/components/VehicleSelector";
import BottomNavigation from "@/components/BottomNavigation";
import { Product } from "@/types/product";
import { Supplier } from "@/types/supplier";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("best");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  function updateCartCount() {
    if (typeof window === "undefined") return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((total: number, item: { quantity?: number }) => total + Number(item.quantity || 1), 0));
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, suppliersData] = await Promise.all([
          getProducts(),
          getSuppliers(),
        ]);
        setProducts(productsData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Unable to load customer marketplace", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
    updateCartCount();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const matches = products.filter((product) =>
      `${product.name} ${product.brand} ${product.partNumber} ${product.description}`
        .toLowerCase()
        .includes(keyword)
    );

    return [...matches].sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return Number(b.quantityAvailable) - Number(a.quantityAvailable);
    });
  }, [products, search, sort]);

  function handleAddToCart(product: Product) {
    const updatedCart = addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });

    setCartCount(
      updatedCart.reduce(
        (total: number, item: { quantity?: number }) => total + Number(item.quantity || 1),
        0
      )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-700" />
          <p className="mt-4 text-sm font-bold text-slate-500">Loading Alpha marketplace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-950 lg:pb-10">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100">
              <Menu size={23} />
            </button>

            <Link href="/customer" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/alpha-logo.png" alt="Alpha" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-xl font-black leading-none tracking-tight">ALPHA</p>
                <p className="mt-1 hidden text-[10px] font-semibold text-slate-500 sm:block">We bring the parts.</p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-1 text-xs font-semibold text-slate-700 md:flex">
            <MapPin size={16} className="text-violet-700" />
            Monterrey, NL
            <ChevronDown size={14} />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 sm:flex">
              <Bell size={19} />
            </button>
            <Link
              href="/customer/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-800 transition hover:bg-violet-50 hover:text-violet-700"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <VehicleSelector />

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3">
            <h2 className="text-base font-extrabold text-slate-950">2. What are you looking for?</h2>
            <p className="mt-1 text-xs text-slate-500">Search by part, brand, or keyword</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brakes, batteries, oils..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>
            <button type="button" className="h-12 rounded-xl bg-violet-700 px-8 text-sm font-extrabold text-white shadow-sm transition hover:bg-violet-800">
              Search
            </button>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/customer/service-request" className="flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-800 transition hover:bg-violet-100">
            <Wrench size={19} />
            Request a Mechanic
          </Link>
          <Link href="/customer/orders" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-800 shadow-sm transition hover:border-violet-200 hover:text-violet-700">
            Track an Existing Order
          </Link>
        </div>

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">Nearby Suppliers</h2>
              <p className="mt-1 text-xs text-slate-500">Available stores serving your location</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-700">{suppliers.filter((supplier) => supplier.availabilityStatus?.toLowerCase() === "available").length} online</span>
          </div>

          {suppliers.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No suppliers are available right now.
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Results</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                {search ? `Parts matching “${search}”` : "Popular Auto Parts"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{filteredProducts.length} products found</p>
            </div>

            <label className="relative flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 shadow-sm sm:self-auto">
              <SlidersHorizontal size={16} className="text-slate-500" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-11 appearance-none bg-transparent pr-7 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="best">Best Match</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 text-slate-400" size={14} />
            </label>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Search className="mx-auto text-slate-300" size={34} />
              <h3 className="mt-3 font-extrabold text-slate-800">No matching parts</h3>
              <p className="mt-1 text-sm text-slate-500">Try another product name, brand, or part number.</p>
            </div>
          )}
        </section>
      </div>

      <BottomNavigation cartCount={cartCount} />
    </main>
  );
}
