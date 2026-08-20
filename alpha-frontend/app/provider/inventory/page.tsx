"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import Image from "next/image";

// ============================================================
// TYPES
// ============================================================

type Product = {
  id: string;
  supplierId?: string;

  partNumber?: string;
  brand: string;
  name: string;
  description?: string;

  imageUrl?: string;
  imageBase64?: string;

  price: number;
  quantityAvailable: number;

  lowStockThreshold?: number;

  currency?: string;
  countryCode?: string;

  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type ProductForm = {
  partNumber: string;
  brand: string;
  name: string;
  description: string;
  price: string;
  quantityAvailable: string;
};

type StoredIdentity = {
  supplierId: string | null;
  userId: string | null;
};

type SupplierProductsResponse = {
  supplierId?: string;
  userId?: string;
  products?: Product[];
};

// ============================================================
// INITIAL FORM
// ============================================================

const initialForm: ProductForm = {
  partNumber: "",
  brand: "",
  name: "",
  description: "",
  price: "",
  quantityAvailable: "",
};

// ============================================================
// GET STORED USER / SUPPLIER IDENTITY
// ============================================================

function getStoredIdentity(): StoredIdentity {
  if (typeof window === "undefined") {
    return {
      supplierId: null,
      userId: null,
    };
  }

  const storedSupplierId =
    localStorage.getItem("supplierId")?.trim() || null;

  const alphaUser = localStorage.getItem("alpha_user");

  if (!alphaUser) {
    return {
      supplierId: storedSupplierId,
      userId: null,
    };
  }

  try {
    const user = JSON.parse(alphaUser) as {
      id?: string;
      Id?: string;

      userId?: string;
      UserId?: string;

      supplierId?: string | null;
      SupplierId?: string | null;

      providerId?: string | null;
      ProviderId?: string | null;
    };

    const userId =
      user.id?.trim() ||
      user.Id?.trim() ||
      user.userId?.trim() ||
      user.UserId?.trim() ||
      null;

    const supplierId =
      storedSupplierId ||
      user.supplierId?.trim() ||
      user.SupplierId?.trim() ||
      user.providerId?.trim() ||
      user.ProviderId?.trim() ||
      null;

    return {
      supplierId,
      userId,
    };
  } catch {
    return {
      supplierId: storedSupplierId,
      userId: null,
    };
  }
}

// ============================================================
// ERROR HANDLER
// ============================================================

function getErrorMessage(error: unknown): string {
  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
          title?: string;
          error?: string;
          detail?: string;
        };
      };
      message?: string;
    }
  )?.response;

  return (
    response?.data?.message ||
    response?.data?.title ||
    response?.data?.error ||
    response?.data?.detail ||
    (error instanceof Error
      ? error.message
      : "An unexpected error occurred.")
  );
}

// ============================================================
// EXTRACT PRODUCTS
//
// Supports both:
// 1. Product[]
//
// 2.
// {
//   supplierId,
//   userId,
//   products: []
// }
// ============================================================

function extractProducts(
  data: Product[] | SupplierProductsResponse
): Product[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.products)
  ) {
    return data.products;
  }

  return [];
}

// ============================================================
// COMPONENT
// ============================================================

export default function ProviderInventoryPage() {
  // ============================================================
  // IDENTITY
  // ============================================================

  const [identity] = useState<StoredIdentity>(() =>
    getStoredIdentity()
  );

  const userId = identity.userId;

  const [supplierId, setSupplierId] =
    useState<string | null>(
      identity.supplierId
    );

  // ============================================================
  // STATE
  // ============================================================

  const [products, setProducts] =
    useState<Product[]>([]);

  const [form, setForm] =
    useState<ProductForm>(
      initialForm
    );

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // RESOLVE SUPPLIER ID FROM USER ID
  // ============================================================

  const resolveSupplierId =
    useCallback(async (): Promise<string | null> => {
      // Already known
      if (supplierId) {
        return supplierId;
      }

      // Cannot resolve without user
      if (!userId) {
        return null;
      }

      try {
        const response = await api.get<{
          supplierId: string;
          userId?: string;
        }>(
          `/api/Products/supplier-id/user/${userId}`
        );

        const resolved =
          response.data?.supplierId?.trim();

        if (!resolved) {
          return null;
        }

        setSupplierId(resolved);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "supplierId",
            resolved
          );
        }

        return resolved;
      } catch (requestError) {
        console.error(
          "Failed to resolve supplier ID:",
          requestError
        );

        return null;
      }
    }, [supplierId, userId]);

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  const loadProducts = useCallback(
    async (
      id: string,
      byUserId = false
    ): Promise<Product[]> => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = byUserId
          ? `/api/Products/supplier/user/${id}`
          : `/api/Products/supplier/${id}`;

        const response = await api.get<
          Product[] | SupplierProductsResponse
        >(endpoint);

        const loadedProducts =
          extractProducts(response.data);

        setProducts(loadedProducts);

        // Resolve supplier ID from returned products
        const resolvedSupplierId =
          loadedProducts.find(
            (product) =>
              typeof product.supplierId ===
                "string" &&
              product.supplierId.trim()
                .length > 0
          )?.supplierId?.trim() || null;

        if (resolvedSupplierId) {
          setSupplierId(
            resolvedSupplierId
          );

          if (
            typeof window !==
            "undefined"
          ) {
            localStorage.setItem(
              "supplierId",
              resolvedSupplierId
            );
          }
        }

        return loadedProducts;
      } catch (requestError) {
        console.error(
          "Failed to load products:",
          requestError
        );

        setProducts([]);

        setError(
          getErrorMessage(
            requestError
          )
        );

        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================
  // INITIALIZE INVENTORY
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const initializeInventory =
      async () => {
        setLoading(true);
        setError(null);

        try {
          // ----------------------------------------------------
          // First resolve supplier ID
          // ----------------------------------------------------

          let actualSupplierId =
            supplierId;

          if (!actualSupplierId) {
            actualSupplierId =
              await resolveSupplierId();
          }

          if (cancelled) {
            return;
          }

          // ----------------------------------------------------
          // If supplier ID exists, load directly
          // ----------------------------------------------------

          if (actualSupplierId) {
            await loadProducts(
              actualSupplierId,
              false
            );

            return;
          }

          // ----------------------------------------------------
          // Otherwise try user ID
          // ----------------------------------------------------

          if (userId) {
            await loadProducts(
              userId,
              true
            );

            return;
          }

          // ----------------------------------------------------
          // Nothing available
          // ----------------------------------------------------

          setProducts([]);

          setError(
            "Supplier account information was not found. Please log in again."
          );
        } catch (requestError) {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to initialize inventory:",
            requestError
          );

          setProducts([]);

          setError(
            getErrorMessage(
              requestError
            )
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void initializeInventory();

    return () => {
      cancelled = true;
    };
  }, [
    userId,
    supplierId,
    resolveSupplierId,
    loadProducts,
  ]);

  // ============================================================
  // TOTAL STOCK
  // ============================================================

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum +
        Number(
          product.quantityAvailable || 0
        ),
      0
    );
  }, [products]);

  // ============================================================
  // TOTAL INVENTORY VALUE
  // ============================================================

  const totalInventoryValue =
    useMemo(() => {
      return products.reduce(
        (sum, product) =>
          sum +
          Number(
            product.price || 0
          ) *
            Number(
              product.quantityAvailable ||
                0
            ),
        0
      );
    }, [products]);

  // ============================================================
  // INVENTORY CURRENCY
  // ============================================================

  const inventoryCurrency =
    products.find(
      (product) =>
        product.currency
    )?.currency || "PHP";

  // ============================================================
  // FORM UPDATE
  // ============================================================

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================================================
  // IMAGE CHANGE
  // ============================================================

  const handleImageChange = (
    file?: File
  ) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );
      return;
    }

    // Revoke old blob URL
    if (
      previewUrl?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedImage(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    if (
      previewUrl?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setForm({
      ...initialForm,
    });

    setEditingProduct(null);

    setSelectedImage(null);

    setPreviewUrl(null);
  };

  // ============================================================
  // START EDIT
  // ============================================================

  const startEdit = (
    product: Product
  ) => {
    setEditingProduct(product);

    setForm({
      partNumber:
        product.partNumber || "",

      brand:
        product.brand || "",

      name:
        product.name || "",

      description:
        product.description || "",

      price:
        String(
          product.price ?? ""
        ),

      quantityAvailable:
        String(
          product.quantityAvailable ??
            ""
        ),
    });

    setSelectedImage(null);

    // Prefer imageUrl
    const existingImage =
      product.imageUrl ||
      product.imageBase64 ||
      null;

    setPreviewUrl(
      existingImage
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // SUBMIT PRODUCT
  // ============================================================

  const submitProduct =
    async () => {
      // --------------------------------------------------------
      // Resolve actual supplier ID
      // --------------------------------------------------------

      const actualSupplierId =
        await resolveSupplierId();

      if (!actualSupplierId) {
        alert(
          "Supplier account information was not found. Please log in again."
        );

        return;
      }

      // --------------------------------------------------------
      // Validation
      // --------------------------------------------------------

      if (!form.name.trim()) {
        alert(
          "Product name is required."
        );

        return;
      }

      if (!form.brand.trim()) {
        alert(
          "Brand is required."
        );

        return;
      }

      const price =
        Number(form.price);

      const quantityAvailable =
        Number(
          form.quantityAvailable
        );

      if (
        !Number.isFinite(
          price
        ) ||
        price <= 0
      ) {
        alert(
          "Price must be greater than 0."
        );

        return;
      }

      if (
        !Number.isInteger(
          quantityAvailable
        ) ||
        quantityAvailable < 0
      ) {
        alert(
          "Stock quantity must be a whole number greater than or equal to 0."
        );

        return;
      }

      // --------------------------------------------------------
      // SAVE
      // --------------------------------------------------------

      setSaving(true);
      setError(null);

      try {
        const data =
          new FormData();

        // IMPORTANT
        data.append(
          "SupplierId",
          actualSupplierId
        );

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
          String(
            quantityAvailable
          )
        );

        data.append(
          "Currency",
          "PHP"
        );

        data.append(
          "CountryCode",
          "PH"
        );

        // Important for UpdateProductUploadDto
        data.append(
          "IsActive",
          "true"
        );

        // Image
        if (
          selectedImage
        ) {
          data.append(
            "Image",
            selectedImage
          );
        }

        // ------------------------------------------------------
        // UPDATE
        // ------------------------------------------------------

        if (
          editingProduct
        ) {
          await api.put(
            `/api/Products/${editingProduct.id}`,
            data
          );
        }

        // ------------------------------------------------------
        // CREATE
        // ------------------------------------------------------

        else {
          await api.post(
            "/api/Products/upload",
            data
          );
        }

        // ------------------------------------------------------
        // IMPORTANT:
        // Reload from DATABASE after save.
        //
        // This guarantees the newly created product
        // appears in "My Products".
        // ------------------------------------------------------

        const refreshedProducts =
          await loadProducts(
            actualSupplierId,
            false
          );

        // Make absolutely sure state contains
        // the refreshed database result.
        setProducts(
          refreshedProducts
        );

        // Clear form
        resetForm();

        // Success message
        alert(
          editingProduct
            ? "Product updated successfully."
            : "Product added successfully."
        );
      } catch (requestError) {
        console.error(
          "Failed to save product:",
          requestError
        );

        const message =
          getErrorMessage(
            requestError
          );

        setError(message);

        alert(
          `Failed to save product.\n\n${message}`
        );
      } finally {
        setSaving(false);
      }
    };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const deleteProduct =
    async (
      product: Product
    ) => {
      // --------------------------------------------------------
      // Resolve supplier
      // --------------------------------------------------------

      const actualSupplierId =
        supplierId ||
        product.supplierId ||
        (await resolveSupplierId());

      if (!actualSupplierId) {
        alert(
          "Supplier ID was not found. Please refresh the inventory first."
        );

        return;
      }

      // --------------------------------------------------------
      // Confirm
      // --------------------------------------------------------

      const confirmed =
        window.confirm(
          `Delete ${product.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError(null);

        // ------------------------------------------------------
        // Delete
        // ------------------------------------------------------

        await api.delete(
          `/api/Products/${product.id}/supplier/${actualSupplierId}`
        );

        // ------------------------------------------------------
        // Reload from database
        // ------------------------------------------------------

        const refreshedProducts =
          await loadProducts(
            actualSupplierId,
            false
          );

        setProducts(
          refreshedProducts
        );

        // If editing deleted product,
        // clear editor.
        if (
          editingProduct?.id ===
          product.id
        ) {
          resetForm();
        }

        alert(
          "Product deleted successfully."
        );
      } catch (requestError) {
        console.error(
          "Failed to delete product:",
          requestError
        );

        const message =
          getErrorMessage(
            requestError
          );

        setError(message);

        alert(
          `Failed to delete product.\n\n${message}`
        );
      }
    };

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshProducts =
    async () => {
      const actualSupplierId =
        await resolveSupplierId();

      if (
        actualSupplierId
      ) {
        await loadProducts(
          actualSupplierId,
          false
        );

        return;
      }

      if (userId) {
        await loadProducts(
          userId,
          true
        );

        return;
      }

      setError(
        "Supplier account information was not found."
      );
    };

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (
    value: number,
    currency = "PHP"
  ) => {
    try {
      return new Intl.NumberFormat(
        "en-PH",
        {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }
      ).format(value);
    } catch {
      return `₱${value.toFixed(
        2
      )}`;
    }
  };

  // ============================================================
  // CLEANUP OBJECT URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (
        previewUrl?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

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

          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p>
              User ID:{" "}
              {userId ||
                "not available"}
            </p>

            <p>
              Supplier ID:{" "}
              {supplierId ||
                "resolving..."}
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <section className="grid gap-4 md:grid-cols-3">

          {/* Total Products */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-black">
              {products.length}
            </p>
          </div>

          {/* Total Stock */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Total Stock
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalStock}
            </p>
          </div>

          {/* Inventory Value */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Inventory Value
            </p>

            <p className="mt-2 text-3xl font-black">
              {formatMoney(
                totalInventoryValue,
                inventoryCurrency
              )}
            </p>
          </div>

        </section>

        {/* ================================================== */}
        {/* ADD / EDIT PRODUCT */}
        {/* ================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-black">
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingProduct
                  ? "Update your product information."
                  : "Add a new product to your inventory."}
              </p>
            </div>

            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
            )}

          </div>

          {/* FORM */}
          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {/* Part Number */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              placeholder="Part Number"
              value={
                form.partNumber
              }
              onChange={(event) =>
                updateForm(
                  "partNumber",
                  event.target.value
                )
              }
            />

            {/* Brand */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              placeholder="Brand"
              value={
                form.brand
              }
              onChange={(event) =>
                updateForm(
                  "brand",
                  event.target.value
                )
              }
            />

            {/* Product Name */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 md:col-span-2"
              placeholder="Product Name"
              value={
                form.name
              }
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
            />

            {/* IMAGE */}
            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageChange(
                    event.target.files?.[0]
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-bold file:text-black"
              />

              {previewUrl && (
                <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                  <Image
                    src={previewUrl}
                    alt="Product preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

            </div>

            {/* DESCRIPTION */}
            <textarea
              className="min-h-28 rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 md:col-span-2"
              placeholder="Description"
              value={
                form.description
              }
              onChange={(event) =>
                updateForm(
                  "description",
                  event.target.value
                )
              }
            />

            {/* PRICE */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Price (PHP)
              </label>

              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={
                  form.price
                }
                onChange={(event) =>
                  updateForm(
                    "price",
                    event.target.value
                  )
                }
              />
            </div>

            {/* STOCK */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Stock Quantity
              </label>

              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
                type="number"
                min="0"
                step="1"
                placeholder="Stock Quantity"
                value={
                  form.quantityAvailable
                }
                onChange={(event) =>
                  updateForm(
                    "quantityAvailable",
                    event.target.value
                  )
                }
              />
            </div>

          </div>

          {/* BUTTONS */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">

            <button
              type="button"
              onClick={() =>
                void submitProduct()
              }
              disabled={
                saving ||
                !supplierId &&
                !userId
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
                type="button"
                onClick={
                  resetForm
                }
                className="w-full rounded-xl border border-white/10 p-4 font-black text-white transition hover:bg-white/10 md:w-52"
              >
                Cancel
              </button>
            )}

          </div>

        </section>

        {/* ================================================== */}
        {/* MY PRODUCTS */}
        {/* ================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">

          {/* HEADER */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-black">
                My Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products belonging to your supplier account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void refreshProducts()
              }
              disabled={
                loading ||
                (!supplierId &&
                  !userId)
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {/* NO SUPPLIER */}
          {!supplierId &&
            !userId &&
            !loading && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
                Supplier account information was not found. Please log out and log in again.
              </div>
            )}

          {/* LOADING */}
          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />

              <p className="mt-4 text-slate-400">
                Loading products...
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            supplierId &&
            products.length ===
              0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">

                <p className="text-lg font-bold text-white">
                  No products yet.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first product using the form above.
                </p>

              </div>
            )}

          {/* ================================================= */}
          {/* PRODUCT GRID */}
          {/* ================================================= */}

          {!loading &&
            products.length >
              0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {products.map(
                  (product) => (
                    <article
                      key={
                        product.id
                      }
                      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 transition hover:border-emerald-400/30"
                    >

                      {/* IMAGE */}
                      {(
                        product.imageUrl ||
                        product.imageBase64
                      ) ? (
                        <div className="relative h-48 w-full bg-black">

                          <Image
                            src={
                              product.imageUrl ||
                              product.imageBase64 ||
                              ""
                            }
                            alt={
                              product.name
                            }
                            fill
                            className="object-contain"
                            unoptimized
                          />

                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-white/5 text-slate-500">
                          No Image
                        </div>
                      )}

                      {/* CONTENT */}
                      <div className="space-y-3 p-4">

                        {/* BRAND */}
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                          {
                            product.brand
                          }
                        </p>

                        {/* NAME */}
                        <h3 className="text-lg font-black">
                          {
                            product.name
                          }
                        </h3>

                        {/* PART NUMBER */}
                        {product.partNumber && (
                          <p className="text-xs text-slate-500">
                            Part #:{" "}
                            {
                              product.partNumber
                            }
                          </p>
                        )}

                        {/* DESCRIPTION */}
                        {product.description && (
                          <p className="line-clamp-2 text-sm text-slate-400">
                            {
                              product.description
                            }
                          </p>
                        )}

                        {/* PRICE + STOCK */}
                        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">

                          <p className="text-xl font-black text-emerald-400">
                            {formatMoney(
                              Number(
                                product.price
                              ),
                              product.currency ||
                                "PHP"
                            )}
                          </p>

                          <p
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              Number(
                                product.quantityAvailable
                              ) <=
                              Number(
                                product.lowStockThreshold ??
                                  5
                              )
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            Stock:{" "}
                            {
                              product.quantityAvailable
                            }
                          </p>

                        </div>

                        {/* COUNTRY / CURRENCY */}
                        <div className="flex gap-2 text-xs text-slate-500">

                          <span className="rounded-full bg-white/5 px-2 py-1">
                            {
                              product.countryCode ||
                              "PH"
                            }
                          </span>

                          <span className="rounded-full bg-white/5 px-2 py-1">
                            {
                              product.currency ||
                              "PHP"
                            }
                          </span>

                          {product.isActive ===
                            false && (
                            <span className="rounded-full bg-red-500/10 px-2 py-1 text-red-400">
                              Inactive
                            </span>
                          )}

                        </div>

                        {/* ACTIONS */}
                        <div className="grid grid-cols-2 gap-3 pt-2">

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                product
                              )
                            }
                            className="rounded-xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteProduct(
                                product
                              )
                            }
                            className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-400"
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    </article>
                  )
                )}

              </div>
            )}

        </section>

      </div>
    </main>
  );
}