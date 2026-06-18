"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/services/products";
import { getSuppliers } from "@/services/suppliers";

import ProductCard from "@/components/ProductCard";
import SupplierCard from "@/components/SupplierCard";
import BottomNavigation from "@/components/BottomNavigation";

import { Product } from "@/types/product";
import { Supplier } from "@/types/supplier";
import { addToCart } from "@/services/cart";
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        p.brand
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [products, search]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Alpha...
      </main>
    );
  }
const handleOrder = (product: Product) => {
  console.log("Ordering:", product);

  localStorage.setItem(
    "selectedProduct",
    JSON.stringify(product)
  );
};
function handleAddToCart(product: Product) {
  addToCart({
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: 1,
    imageUrl: product.imageUrl,
  });

  alert(`${product.name} added to cart`);
}
  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">

      {/* HERO */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 p-6">
        <div className="max-w-7xl mx-auto">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                ALPHA
              </h1>

              <p className="text-green-100 mt-1">
                We bring the parts.
              </p>
            </div>

            <div className="text-right">
              <div className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold">
                LIVE
              </div>
            </div>
          </div>

          <div className="mt-6">
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search parts, brands..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
            />
          </div>
        </div>
      </section>

      {/* SUPPLIERS */}
      <section className="max-w-7xl mx-auto p-4">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-xl">
              Available Suppliers
            </h2>

            <span className="text-green-400 text-sm">
              {suppliers.length} Online
            </span>
          </div>

          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
              />
            ))}
          </div>
        </div>

      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto p-4">

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">
            Auto Parts Marketplace
          </h2>

          <span className="text-slate-400">
            {filteredProducts.length} Parts
          </span>
        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-4
          "
        >
          {filteredProducts.map((product) => (
            <ProductCard
  key={product.id}
  product={product}
  onAddToCart={handleAddToCart}
/>
          ))}
        </div>

      </section>

      <BottomNavigation />
    </main>
  );
}