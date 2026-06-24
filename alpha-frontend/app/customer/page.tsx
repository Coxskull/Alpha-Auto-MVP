"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  MapPin,
  Truck,
  Star,
} from "lucide-react";

import { getProducts } from "@/services/products";
import { getSuppliers } from "@/services/suppliers";
import { addToCart } from "@/services/cart";

import ProductCard from "@/components/ProductCard";
import SupplierCard from "@/components/SupplierCard";
import BottomNavigation from "@/components/BottomNavigation";

import { Product } from "@/types/product";
import { Supplier } from "@/types/supplier";

export default function HomePage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [cartCount, setCartCount] =
    useState(0);

  function updateCartCount() {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      setCartCount(cart.length);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, suppliersData] =
          await Promise.all([
            getProducts(),
            getSuppliers(),
          ]);

        setProducts(productsData);
        setSuppliers(suppliersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    setTimeout(() => {
      updateCartCount();
    }, 0);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      `${p.name} ${p.brand}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  function handleAddToCart(product: Product) {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });

    updateCartCount();

    alert(`${product.name} added to cart`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Loading Alpha...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-24">
      {/* HEADER */}
      <section className="sticky top-0 z-30 bg-[#020617]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-black">
                ALPHA
              </h1>

              <p className="text-xs text-slate-400">
                Auto parts delivered fast
              </p>
            </div>
          </div>

          <a
            href="/cart"
            className="relative h-10 w-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center"
          >
            <ShoppingCart size={20} />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </section>

      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-700 via-green-800 to-slate-950 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-white/10 border border-white/10 p-6">
            <span className="inline-flex bg-emerald-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              LIVE MARKETPLACE
            </span>

            <h2 className="text-4xl font-black mt-4 leading-tight">
              Find auto parts near you
            </h2>

            <p className="text-slate-200 mt-3">
              Search brake pads, oils,
              batteries, spark plugs and
              more.
            </p>

            <div className="mt-6 relative">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={20}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search parts..."
                className="w-full bg-white text-slate-900 rounded-2xl pl-12 pr-4 py-4 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-black/20 rounded-2xl p-4">
                <Truck className="text-emerald-300" />
                <p className="font-bold mt-2 text-sm">
                  Delivery
                </p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4">
                <MapPin className="text-emerald-300" />
                <p className="font-bold mt-2 text-sm">
                  Nearby
                </p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4">
                <Star className="text-emerald-300" />
                <p className="font-bold mt-2 text-sm">
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPLIERS */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">
            Suppliers
          </h2>

          <span className="text-emerald-400 text-sm">
            {suppliers.length} Online
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
            />
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">
            Popular Parts
          </h2>

          <span className="text-slate-400 text-sm">
            {filteredProducts.length} Parts
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      <BottomNavigation cartCount={cartCount} />
    </main>
  );
}