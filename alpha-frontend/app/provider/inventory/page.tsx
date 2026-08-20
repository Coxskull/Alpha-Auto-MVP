"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import Image from "next/image";

type Product = {
  id: string;
  supplierId?: string;
  partNumber?: string;
  brand: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantityAvailable: number;
  currency?: string;
  countryCode?: string;
};

type ProductForm = {
  partNumber: string;
  brand: string;
  name: string;
  description: string;
  price: string;
  quantityAvailable: string;
};

type SupplierProductsResponse = {
  supplierId: string;
  products: Product[];
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
      title?: string;
      detail?: string;
    } | string;
  };
  message?: string;
};

const initialForm: ProductForm = {
  partNumber: "",
  brand: "",
  name: "",
  description: "",
  price: "",
  quantityAvailable: "",
};

function getUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const alphaUser = localStorage.getItem("alpha_user");

  if (!alphaUser) {
    return null;
  }

  try {
    const user = JSON.parse(alphaUser);

    return (
      user.id ||
      user.Id ||
      user.user_id ||
      user.userId ||
      null
    );
  } catch {
    return null;
  }
}

function getStoredSupplierId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const supplierId = localStorage.getItem("supplierId");

  if (!supplierId?.trim()) {
    return null;
  }

  return supplierId.trim();
}

export default function ProviderInventoryPage() {
  /*
   * The logged-in user's ID is NOT the same as the supplier ID.
   */
  const [userId] = useState<string | null>(() => getUserId());

  /*
   * We may already have the supplier ID cached from a previous visit.
   */
  const [supplierId, setSupplierId] = useState<string | null>(
    () => getStoredSupplierId()
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /*
   * Resolve:
   *
   * alpha_user.id
   *      ↓
   * suppliers.user_id
   *      ↓
   * suppliers.Id
   */
  const resolveSupplier = useCallback(async (id: string) => {
    try {
      const response = await api.get<SupplierProductsResponse>(
        `/api/Products/supplier/user/${id}`
      );

      const resolvedSupplierId = response.data.supplierId;

      if (!resolvedSupplierId) {
        throw new Error("Supplier ID was not returned by the server.");
      }

      localStorage.setItem("supplierId", resolvedSupplierId);

      return response.data;
    } catch (error) {
      console.error("Failed to resolve supplier:", error);
      throw error;
    }
  }, []);

  /*
   * Load products using the REAL supplier ID.
   */
  const loadProducts = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const response = await api.get<Product[]>(
        `/api/Products/supplier/${id}`
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Failed to load products:", error);

      const apiError = error as ApiError;

      console.error(
        "Products load status:",
        apiError.response?.status
      );

      console.error(
        "Products load response:",
        apiError.response?.data
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Initial supplier/product loading.
   *
   * The timeout prevents the React hooks ESLint rule from
   * treating the state updates as synchronous effect updates.
   */
  useEffect(() => {
    if (!userId) {
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          /*
           * If we already have a supplier ID, use it.
           */
          if (supplierId) {
            await loadProducts(supplierId);
            return;
          }

          /*
           * Otherwise resolve user ID → supplier ID.
           */
          const result = await resolveSupplier(userId);

          setSupplierId(result.supplierId);
          setProducts(result.products);
        } catch (error) {
          console.error(
            "Failed to initialize provider inventory:",
            error
          );
        }
      })();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    userId,
    supplierId,
    loadProducts,
    resolveSupplier,
  ]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, product) => {
      return (
        sum +
        Number(product.price) *
          Number(product.quantityAvailable)
      );
    }, 0);
  }, [products]);

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum + Number(product.quantityAvailable),
      0
    );
  }, [products]);

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleImageChange = (file?: File) => {
    if (!file) {
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

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
      quantityAvailable: String(
        product.quantityAvailable
      ),
    });

    setSelectedImage(null);
    setPreviewUrl(product.imageUrl || null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const submitProduct = async () => {
    /*
     * supplierId must be the ID from suppliers.Id.
     */
    if (!supplierId) {
      alert(
        "Supplier profile not found. Please login again."
      );
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
    const quantityAvailable = Number(
      form.quantityAvailable
    );

    if (!Number.isFinite(price) || price <= 0) {
      alert("Price must be greater than 0.");
      return;
    }

    if (
      !Number.isInteger(quantityAvailable) ||
      quantityAvailable < 0
    ) {
      alert(
        "Stock quantity must be a whole number and cannot be negative."
      );
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      /*
       * IMPORTANT:
       *
       * This MUST be suppliers.Id.
       *
       * Do NOT send userId here.
       */
      data.append("SupplierId", supplierId);

      data.append(
        "PartNumber",
        form.partNumber.trim()
      );

      data.append("Brand", form.brand.trim());

      data.append("Name", form.name.trim());

      data.append(
        "Description",
        form.description.trim()
      );

      data.append("Price", String(price));

      data.append(
        "QuantityAvailable",
        String(quantityAvailable)
      );

      data.append("Currency", "MXN");
      data.append("CountryCode", "MX");

      if (selectedImage) {
        data.append("Image", selectedImage);
      }

      /*
       * EDIT
       */
      if (editingProduct) {
        await api.put(
          `/api/Products/${editingProduct.id}`,
          data
        );
      }

      /*
       * CREATE
       */
      else {
        await api.post(
          "/api/Products/upload",
          data
        );
      }

      /*
       * Save was successful.
       * Clear the form first.
       */
      resetForm();

      /*
       * Immediately reload My Products.
       */
      await loadProducts(supplierId);

      alert(
        editingProduct
          ? "Product updated successfully."
          : "Product added successfully."
      );
    } catch (error: unknown) {
      console.error(
        "Failed to save product:",
        error
      );

      const apiError = error as ApiError;

      const status =
        apiError.response?.status;

      const responseData =
        apiError.response?.data;

      console.error("Status:", status);
      console.error(
        "Response:",
        responseData
      );

      let message =
        "Failed to save product.";

      if (
        typeof responseData === "string"
      ) {
        message = responseData;
      } else if (responseData) {
        message =
          responseData.message ||
          responseData.title ||
          responseData.detail ||
          message;
      } else if (apiError.message) {
        message = apiError.message;
      }

      alert(
        `Failed to save product${
          status ? ` (${status})` : ""
        }:\n${message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (
    product: Product
  ) => {
    if (!supplierId) {
      alert("Supplier ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${product.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/Products/${product.id}/supplier/${supplierId}`
      );

      /*
       * Remove immediately from the UI.
       */
      setProducts((previous) =>
        previous.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (error: unknown) {
      console.error(
        "Failed to delete product:",
        error
      );

      const apiError = error as ApiError;

      const status =
        apiError.response?.status;

      const responseData =
        apiError.response?.data;

      const message =
        typeof responseData === "string"
          ? responseData
          : "Failed to delete product.";

      alert(
        `Failed to delete product${
          status ? ` (${status})` : ""
        }:\n${message}`
      );
    }
  };

  /*
   * No logged-in user.
   */
  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            User information was not found.
            Please login again.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
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

        {/* STATISTICS */}
        <section className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-black">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Total Stock
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalStock}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Inventory Value
            </p>

            <p className="mt-2 text-3xl font-black">
              ${totalInventoryValue.toFixed(2)}
            </p>
          </div>

        </section>

        {/* ADD / EDIT PRODUCT */}
        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">

          <h2 className="text-xl font-black">
            {editingProduct
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {/* PART NUMBER */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              placeholder="Part Number"
              value={form.partNumber}
              onChange={(event) =>
                updateForm(
                  "partNumber",
                  event.target.value
                )
              }
            />

            {/* BRAND */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              placeholder="Brand"
              value={form.brand}
              onChange={(event) =>
                updateForm(
                  "brand",
                  event.target.value
                )
              }
            />

            {/* PRODUCT NAME */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400 md:col-span-2"
              placeholder="Product Name"
              value={form.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
            />

            {/* IMAGE */}
            <div className="md:col-span-2">

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageChange(
                    event.target.files?.[0]
                  )
                }
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

            {/* DESCRIPTION */}
            <textarea
              className="min-h-28 rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400 md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(event) =>
                updateForm(
                  "description",
                  event.target.value
                )
              }
            />

            {/* PRICE */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(event) =>
                updateForm(
                  "price",
                  event.target.value
                )
              }
            />

            {/* QUANTITY */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              type="number"
              min="0"
              step="1"
              placeholder="Stock Quantity"
              value={form.quantityAvailable}
              onChange={(event) =>
                updateForm(
                  "quantityAvailable",
                  event.target.value
                )
              }
            />

          </div>

          {/* BUTTONS */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">

            <button
              onClick={submitProduct}
              disabled={
                saving || !supplierId
              }
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

        {/* PRODUCTS */}
        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-black">
              My Products
            </h2>

            <button
              onClick={() =>
                supplierId &&
                loadProducts(supplierId)
              }
              disabled={
                loading || !supplierId
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {!supplierId && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">
              Loading supplier profile...
            </div>
          )}

          {supplierId &&
            products.length === 0 &&
            !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                No products yet.
              </div>
            )}

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
              Loading products...
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => (

              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
              >

                {/* IMAGE */}
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

                  {/* BRAND */}
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                    {product.brand}
                  </p>

                  {/* NAME */}
                  <h3 className="text-lg font-black">
                    {product.name}
                  </h3>

                  {/* PART NUMBER */}
                  {product.partNumber && (
                    <p className="text-xs text-slate-500">
                      Part #: {product.partNumber}
                    </p>
                  )}

                  {/* DESCRIPTION */}
                  {product.description && (
                    <p className="line-clamp-2 text-sm text-slate-400">
                      {product.description}
                    </p>
                  )}

                  {/* PRICE / STOCK */}
                  <div className="flex items-center justify-between pt-3">

                    <p className="text-xl font-black text-emerald-400">
                      $
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </p>

                    <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                      Stock:{" "}
                      {product.quantityAvailable}
                    </p>

                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-3 pt-4">

                    <button
                      onClick={() =>
                        startEdit(product)
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-400"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(product)
                      }
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