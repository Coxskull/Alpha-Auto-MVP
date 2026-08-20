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

const initialForm: ProductForm = {
  partNumber: "",
  brand: "",
  name: "",
  description: "",
  price: "",
  quantityAvailable: "",
};

/**
 * Gets the logged-in Alpha user ID.
 *
 * This is NOT the supplier ID.
 * We use this to call:
 *
 * /api/Products/supplier/user/{userId}
 *
 * The backend then finds:
 *
 * user_id -> Suppliers.Id
 */
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

    const id =
      user.id ??
      user.Id ??
      user.user_id ??
      user.userId ??
      null;

    if (!id) {
      return null;
    }

    return String(id);
  } catch (error) {
    console.error("Failed to parse alpha_user:", error);
    return null;
  }
}

export default function ProviderInventoryPage() {
  const [userId] = useState<string | null>(() => getUserId());

  /**
   * This is the REAL supplier ID returned by the backend.
   *
   * Example:
   *
   * userId:
   * d6a50a2d-259d-4dcb-826e-9faca287615a
   *
   * supplierId:
   * ea433cf3-7fac-4cf4-aae5-b7eae2f1158b
   */
  const [supplierId, setSupplierId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Load products using the logged-in USER ID.
   *
   * Backend converts:
   *
   * user ID -> supplier ID -> products
   */
  const loadProducts = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const response =
        await api.get<SupplierProductsResponse>(
          `/api/Products/supplier/user/${id}`
        );

      const returnedSupplierId = response.data.supplierId;
      const returnedProducts = response.data.products ?? [];

      console.log("Supplier ID:", returnedSupplierId);
      console.log("Products:", returnedProducts);

      setSupplierId(returnedSupplierId);
      setProducts(returnedProducts);

      // Keep supplier ID locally so subsequent requests can use it.
      localStorage.setItem(
        "supplierId",
        returnedSupplierId
      );
    } catch (error: unknown) {
      console.error(
        "Failed to load supplier products:",
        error
      );

      const axiosError = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
        message?: string;
      };

      console.error(
        "Status:",
        axiosError.response?.status
      );

      console.error(
        "Response:",
        axiosError.response?.data
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial product loading.
   *
   * setTimeout prevents the React Hooks
   * set-state-in-effect warning while still
   * loading immediately after mount.
   */
  useEffect(() => {
    if (!userId) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadProducts(userId);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [userId, loadProducts]);

  /**
   * Inventory value.
   */
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, product) => {
      return (
        sum +
        Number(product.price) *
          Number(product.quantityAvailable)
      );
    }, 0);
  }, [products]);

  /**
   * Update form field.
   */
  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle image selection.
   */
  const handleImageChange = (file?: File) => {
    if (!file) {
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);

    const newPreviewUrl = URL.createObjectURL(file);

    setPreviewUrl(newPreviewUrl);
  };

  /**
   * Reset form.
   */
  const resetForm = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setForm(initialForm);
    setEditingProduct(null);
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  /**
   * Start editing a product.
   */
  const startEdit = (product: Product) => {
    setEditingProduct(product);

    setForm({
      partNumber: product.partNumber ?? "",
      brand: product.brand ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      quantityAvailable: String(
        product.quantityAvailable ?? ""
      ),
    });

    setSelectedImage(null);

    setPreviewUrl(product.imageUrl ?? null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Add or update product.
   */
  const submitProduct = async () => {
    if (!supplierId) {
      alert(
        "Supplier ID not found. Please refresh the page or login again."
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

      /**
       * IMPORTANT:
       *
       * This MUST be the supplier ID.
       *
       * NOT:
       * userId
       *
       * NOT:
       * user.id
       */
      data.append("SupplierId", supplierId);

      data.append(
        "PartNumber",
        form.partNumber.trim()
      );

      data.append(
        "Brand",
        form.brand.trim()
      );

      data.append(
        "Name",
        form.name.trim()
      );

      data.append(
        "Description",
        form.description.trim()
      );

      data.append(
        "Price",
        String(price)
      );

      data.append(
        "QuantityAvailable",
        String(quantityAvailable)
      );

      data.append("Currency", "MXN");
      data.append("CountryCode", "MX");

      if (selectedImage) {
        data.append("Image", selectedImage);
      }

      let savedProduct: Product;

      if (editingProduct) {
        const response =
          await api.put<Product>(
            `/api/Products/${editingProduct.id}`,
            data
          );

        savedProduct = response.data;

        /**
         * Immediately update the card.
         */
        setProducts((prev) =>
          prev.map((product) =>
            product.id === savedProduct.id
              ? savedProduct
              : product
          )
        );
      } else {
        const response =
          await api.post<Product>(
            "/api/Products/upload",
            data
          );

        savedProduct = response.data;

        /**
         * Immediately add the new product
         * to My Products.
         *
         * This makes the cards update without
         * waiting for another GET request.
         */
        setProducts((prev) => [
          savedProduct,
          ...prev,
        ]);
      }

      resetForm();

      /**
       * Refresh from backend after the immediate
       * state update.
       *
       * This guarantees the UI matches the database.
       */
      await loadProducts(userId as string);

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

      const axiosError = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
        message?: string;
      };

      const status =
        axiosError.response?.status;

      const responseData =
        axiosError.response?.data;

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
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        const data =
          responseData as {
            message?: string;
            title?: string;
            detail?: string;
          };

        message =
          data.message ||
          data.title ||
          data.detail ||
          message;
      } else if (
        axiosError.message
      ) {
        message =
          axiosError.message;
      }

      alert(
        `Failed to save product${
          status
            ? ` (${status})`
            : ""
        }:\n${message}`
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete product.
   */
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

      /**
       * Immediately remove the card.
       */
      setProducts((prev) =>
        prev.filter(
          (item) =>
            item.id !== product.id
        )
      );
    } catch (error: unknown) {
      console.error(
        "Failed to delete product:",
        error
      );

      alert(
        "Failed to delete product."
      );
    }
  };

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

        {/* SUMMARY CARDS */}

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
              {products.reduce(
                (sum, product) =>
                  sum +
                  Number(
                    product.quantityAvailable
                  ),
                0
              )}
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

        {/* ADD / EDIT */}

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">

          <h2 className="text-xl font-black">
            {editingProduct
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              placeholder="Part Number"
              value={form.partNumber}
              onChange={(e) =>
                updateForm(
                  "partNumber",
                  e.target.value
                )
              }
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) =>
                updateForm(
                  "brand",
                  e.target.value
                )
              }
            />

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400 md:col-span-2"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) =>
                updateForm(
                  "name",
                  e.target.value
                )
              }
            />

            {/* IMAGE */}

            <div className="md:col-span-2">

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(
                    e.target.files?.[0]
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
              onChange={(e) =>
                updateForm(
                  "description",
                  e.target.value
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
              onChange={(e) =>
                updateForm(
                  "price",
                  e.target.value
                )
              }
            />

            {/* STOCK */}

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
              type="number"
              min="0"
              step="1"
              placeholder="Stock Quantity"
              value={
                form.quantityAvailable
              }
              onChange={(e) =>
                updateForm(
                  "quantityAvailable",
                  e.target.value
                )
              }
            />

          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">

            <button
              onClick={submitProduct}
              disabled={
                saving ||
                !supplierId
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

            <div>
              <h2 className="text-xl font-black">
                My Products
              </h2>

              {supplierId && (
                <p className="mt-1 text-xs text-slate-500">
                  Supplier: {supplierId}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                if (userId) {
                  void loadProducts(userId);
                }
              }}
              disabled={
                loading ||
                !userId
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {!userId && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              User ID not found. Please login again.
            </div>
          )}

          {userId &&
            !supplierId &&
            !loading && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">
                Loading supplier profile...
              </div>
            )}

          {userId &&
            products.length === 0 &&
            !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                No products yet.
              </div>
            )}

          {/* PRODUCT GRID */}

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

                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                    {product.brand}
                  </p>

                  <h3 className="text-lg font-black">
                    {product.name}
                  </h3>

                  {product.partNumber && (
                    <p className="text-xs text-slate-500">
                      Part #:{" "}
                      {product.partNumber}
                    </p>
                  )}

                  {product.description && (
                    <p className="line-clamp-2 text-sm text-slate-400">
                      {product.description}
                    </p>
                  )}

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
                        void deleteProduct(
                          product
                        )
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