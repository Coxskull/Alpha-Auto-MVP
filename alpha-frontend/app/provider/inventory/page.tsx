"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import Image from "next/image";

type Product = {
  id: string;
  partNumber?: string;
  brand: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantityAvailable: number;
};

type ProductForm = {
  partNumber: string;
  brand: string;
  name: string;
  description: string;
  price: string;
  quantityAvailable: string;
};

const initialForm: ProductForm = {
  partNumber: "",
  brand: "",
  name: "",
  description: "",
  price: "",
  quantityAvailable: "",
};

function getSupplierId() {
  if (typeof window === "undefined") return null;

  const storedSupplierId = localStorage.getItem("supplierId");
  if (storedSupplierId) return storedSupplierId;

  const alphaUser = localStorage.getItem("alpha_user");
  if (!alphaUser) return null;

  try {
    const user = JSON.parse(alphaUser);
    return user.supplierId || user.SupplierId || user.providerId || user.id || null;
  } catch {
    return null;
  }
}

export default function ProviderInventoryPage() {
  const [supplierId] = useState<string | null>(() => getSupplierId());
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const res = await api.get<Product[]>(`/api/Products/supplier/${id}`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  if (!supplierId) return;

  localStorage.setItem("supplierId", supplierId);

  queueMicrotask(() => {
    void loadProducts(supplierId);
  });
}, [supplierId, loadProducts]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, product) => {
      return sum + Number(product.price) * Number(product.quantityAvailable);
    }, 0);
  }, [products]);

  const updateForm = (field: keyof ProductForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingProduct(null);
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      partNumber: product.partNumber || "",
      brand: product.brand || "",
      name: product.name || "",
      description: product.description || "",
      price: String(product.price),
      quantityAvailable: String(product.quantityAvailable),
    });
    setSelectedImage(null);
    setPreviewUrl(product.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitProduct = async () => {
    if (!supplierId) {
      alert("Supplier ID not found. Please login again.");
      return;
    }

    if (!form.name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!form.brand.trim()) {
      alert("Brand is required.");
      return;
    }

    const price = Number(form.price);
    const quantityAvailable = Number(form.quantityAvailable);

    if (price <= 0) {
      alert("Price must be greater than 0.");
      return;
    }

    if (quantityAvailable < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      data.append("SupplierId", supplierId);
      data.append("PartNumber", form.partNumber);
      data.append("Brand", form.brand);
      data.append("Name", form.name);
      data.append("Description", form.description);
      data.append("Price", String(price));
      data.append("QuantityAvailable", String(quantityAvailable));

      if (selectedImage) {
        data.append("Image", selectedImage);
      }

      if (editingProduct) {
        await api.put(`/api/Products/${editingProduct.id}`, data);
      } else {
        await api.post("/api/Products/upload", data);
      }

      resetForm();
      await loadProducts(supplierId);
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!supplierId) return;

    const confirmed = confirm(`Delete ${product.name}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/Products/${product.id}/supplier/${supplierId}`);
      await loadProducts(supplierId);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Provider Portal
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Inventory Management
          </h1>
          <p className="mt-2 text-slate-400">
            Add, edit, or delete your products here.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Total Products</p>
            <p className="mt-2 text-3xl font-black">{products.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Total Stock</p>
            <p className="mt-2 text-3xl font-black">
              {products.reduce(
                (sum, product) => sum + Number(product.quantityAvailable),
                0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Inventory Value</p>
            <p className="mt-2 text-3xl font-black">
              ${totalInventoryValue.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">
          <h2 className="text-xl font-black">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              placeholder="Part Number"
              value={form.partNumber}
              onChange={(e) => updateForm("partNumber", e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => updateForm("brand", e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400 md:col-span-2"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />

            <div className="md:col-span-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
              />

              {previewUrl && (
                <div className="relative mt-4 h-48 w-full overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={previewUrl}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <textarea
              className="min-h-28 rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400 md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              type="number"
              min="0"
              placeholder="Stock Quantity"
              value={form.quantityAvailable}
              onChange={(e) =>
                updateForm("quantityAvailable", e.target.value)
              }
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <button
              onClick={submitProduct}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-500 p-4 font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingProduct
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingProduct && (
              <button
                onClick={resetForm}
                type="button"
                className="w-full rounded-xl border border-white/10 p-4 font-black text-white transition hover:bg-white/10 md:w-52"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">My Products</h2>

            <button
              onClick={() => supplierId && loadProducts(supplierId)}
              disabled={loading || !supplierId}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {!supplierId && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              Supplier ID not found. Please login again.
            </div>
          )}

          {supplierId && products.length === 0 && !loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
              No products yet.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
              >
                {product.imageUrl ? (
                  <div className="relative h-44 w-full">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center bg-white/5 text-slate-500">
                    No Image
                  </div>
                )}

                <div className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                    {product.brand}
                  </p>

                  <h3 className="text-lg font-black">{product.name}</h3>

                  {product.description && (
                    <p className="line-clamp-2 text-sm text-slate-400">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3">
                    <p className="text-xl font-black text-emerald-400">
                      ${Number(product.price).toFixed(2)}
                    </p>

                    <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                      Stock: {product.quantityAvailable}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => startEdit(product)}
                      className="rounded-xl bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-400"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(product)}
                      className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}