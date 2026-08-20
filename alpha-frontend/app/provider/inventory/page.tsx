"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import api from "@/services/api";
import Image from "next/image";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  partNumber?: string;
  brand: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantityAvailable: number;
  isActive?: boolean;
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

const initialForm: ProductForm = {
  partNumber: "",
  brand: "",
  name: "",
  description: "",
  price: "",
  quantityAvailable: "",
};

/* =========================================================
   SUPPLIER ID STORE
========================================================= */

/**
 * We use an external store instead of:
 *
 * useEffect(() => {
 *   setSupplierId(...)
 * }, []);
 *
 * because React's set-state-in-effect rule correctly warns
 * about synchronous state updates inside effects.
 *
 * useSyncExternalStore is intended for external browser state
 * such as localStorage/event-based state.
 */

let supplierIdSnapshot: string | null = null;

let supplierStoreInitialized = false;

const supplierListeners = new Set<() => void>();

let supplierResolvePromise: Promise<void> | null = null;

/* ---------------------------------------------------------
   Read supplier ID from localStorage
--------------------------------------------------------- */

function readStoredSupplierId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const directSupplierId =
    window.localStorage.getItem("supplierId");

  if (directSupplierId?.trim()) {
    return directSupplierId.trim();
  }

  const alphaUserRaw =
    window.localStorage.getItem("alpha_user");

  if (!alphaUserRaw) {
    return null;
  }

  try {
    const user = JSON.parse(alphaUserRaw);

    const supplierId =
      user?.supplierId ??
      user?.SupplierId ??
      user?.supplier?.id ??
      user?.supplier?.Id ??
      null;

    if (!supplierId) {
      return null;
    }

    const id = String(supplierId).trim();

    if (!id) {
      return null;
    }

    window.localStorage.setItem(
      "supplierId",
      id
    );

    return id;
  } catch (error) {
    console.error(
      "Failed to parse alpha_user:",
      error
    );

    return null;
  }
}

/* ---------------------------------------------------------
   Read logged-in user ID
--------------------------------------------------------- */

function readStoredUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const alphaUserRaw =
    window.localStorage.getItem("alpha_user");

  if (!alphaUserRaw) {
    return null;
  }

  try {
    const user = JSON.parse(alphaUserRaw);

    const userId =
      user?.id ??
      user?.Id ??
      user?.userId ??
      user?.UserId ??
      user?.user_id ??
      user?.userID ??
      null;

    if (!userId) {
      return null;
    }

    const id = String(userId).trim();

    return id || null;
  } catch (error) {
    console.error(
      "Failed to parse alpha_user:",
      error
    );

    return null;
  }
}

/* ---------------------------------------------------------
   Notify subscribers
--------------------------------------------------------- */

function notifySupplierListeners() {
  supplierListeners.forEach(
    (listener) => listener()
  );
}

/* ---------------------------------------------------------
   Resolve supplier ID
--------------------------------------------------------- */

async function resolveSupplierId(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (supplierResolvePromise) {
    return supplierResolvePromise;
  }

  supplierResolvePromise = (async () => {
    /**
     * 1. Try localStorage first.
     */
    const storedSupplierId =
      readStoredSupplierId();

    if (storedSupplierId) {
      supplierIdSnapshot =
        storedSupplierId;

      notifySupplierListeners();

      return;
    }

    /**
     * 2. No supplierId stored.
     *
     * Try to get the logged-in user's ID.
     */
    const userId =
      readStoredUserId();

    if (!userId) {
      console.warn(
        "Unable to resolve supplier ID because no user ID was found in alpha_user."
      );

      supplierIdSnapshot = null;

      notifySupplierListeners();

      return;
    }

    console.log(
      "Resolving supplier from user ID:",
      userId
    );

    /**
     * 3. Resolve Supplier.Id using:
     *
     * GET /api/Products/supplier/user/{userId}
     *
     * Backend returns:
     *
     * {
     *   id: "...",
     *   userId: "..."
     * }
     */
    try {
      const response = await api.get<{
  id: string;
  userId: string;
}>(
  `/api/Products/supplier/by-user/${encodeURIComponent(
    userId
  )}`
);

      /**
       * This endpoint currently returns products,
       * not the Supplier entity itself.
       *
       * Therefore we obtain SupplierId from the
       * first returned product.
       */
      const products = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      const firstProduct =
        products[0];

      /**
       * Product response contains supplierId
       * from the backend model.
       *
       * We support both camelCase and PascalCase.
       */
      const resolvedSupplierId =
  response.data?.id;

if (resolvedSupplierId) {
  const id =
    String(
      resolvedSupplierId
    ).trim();

  supplierIdSnapshot = id;

  window.localStorage.setItem(
    "supplierId",
    id
  );

  console.log(
    "Resolved Supplier ID:",
    id
  );

  notifySupplierListeners();

  return;
}

      console.warn(
        "Supplier profile exists, but no product was returned. Supplier ID cannot be inferred from this endpoint."
      );

      supplierIdSnapshot = null;

      notifySupplierListeners();
    } catch (error) {
      console.error(
        "Failed to resolve supplier from user ID:",
        error
      );

      supplierIdSnapshot = null;

      notifySupplierListeners();
    }
  })();

  try {
    await supplierResolvePromise;
  } finally {
    supplierResolvePromise = null;
  }
}

/* ---------------------------------------------------------
   External store subscription
--------------------------------------------------------- */

function subscribeToSupplierId(
  callback: () => void
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  supplierListeners.add(callback);

  const handleStorage = () => {
    const newSupplierId =
      readStoredSupplierId();

    if (
      newSupplierId !==
      supplierIdSnapshot
    ) {
      supplierIdSnapshot =
        newSupplierId;

      notifySupplierListeners();
    }

    /**
     * If supplier ID was removed,
     * try resolving it again from alpha_user.
     */
    if (!newSupplierId) {
      void resolveSupplierId();
    }
  };

  window.addEventListener(
    "storage",
    handleStorage
  );

  window.addEventListener(
    "supplier-id-changed",
    handleStorage
  );

  /**
   * Initialize only after subscribing.
   *
   * This keeps render pure and avoids
   * setState-in-effect problems.
   */
  if (!supplierStoreInitialized) {
    supplierStoreInitialized = true;

    const storedSupplierId =
      readStoredSupplierId();

    if (storedSupplierId) {
      supplierIdSnapshot =
        storedSupplierId;

      notifySupplierListeners();
    } else {
      void resolveSupplierId();
    }
  }

  return () => {
    supplierListeners.delete(callback);

    window.removeEventListener(
      "storage",
      handleStorage
    );

    window.removeEventListener(
      "supplier-id-changed",
      handleStorage
    );
  };
}

function getSupplierIdSnapshot() {
  return supplierIdSnapshot;
}

function getServerSupplierIdSnapshot() {
  return null;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ProviderInventoryPage() {
  const supplierId =
    useSyncExternalStore(
      subscribeToSupplierId,
      getSupplierIdSnapshot,
      getServerSupplierIdSnapshot
    );

  const [products, setProducts] =
    useState<Product[]>([]);

  const [form, setForm] =
    useState<ProductForm>(
      initialForm
    );

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(null);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts =
    useCallback(
      async (id: string) => {
        if (!id) {
          console.warn(
            "Cannot load products: supplierId is empty."
          );

          return;
        }

        setLoading(true);

        try {
          console.log(
            "Loading products for supplier:",
            id
          );

          const response =
            await api.get<Product[]>(
              `/api/Products/supplier/${encodeURIComponent(
                id
              )}`
            );

          console.log(
            "Products returned from API:",
            response.data
          );

          setProducts(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );
        } catch (error) {
          console.error(
            "Failed to load products:",
            error
          );

          setProducts([]);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /* =======================================================
     LOAD PRODUCTS WHEN SUPPLIER ID CHANGES
  ======================================================= */

  useEffect(() => {
    if (!supplierId) {
      return;
    }

    let cancelled = false;

    /**
     * IMPORTANT:
     *
     * Do not call setState directly here.
     *
     * loadProducts handles the asynchronous
     * state updates itself.
     */
    const load = async () => {
      try {
        setLoading(true);

        console.log(
          "Loading inventory for supplier:",
          supplierId
        );

        const response =
          await api.get<Product[]>(
            `/api/Products/supplier/${encodeURIComponent(
              supplierId
            )}`
          );

        if (cancelled) {
          return;
        }

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setProducts(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load products:",
          error
        );

        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  /* =======================================================
     TOTAL INVENTORY VALUE
  ======================================================= */

  const totalInventoryValue =
    useMemo(() => {
      return products.reduce(
        (sum, product) => {
          return (
            sum +
            Number(
              product.price || 0
            ) *
              Number(
                product.quantityAvailable ||
                  0
              )
          );
        },
        0
      );
    }, [products]);

  /* =======================================================
     TOTAL STOCK
  ======================================================= */

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

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     IMAGE SELECTION
  ======================================================= */

  const handleImageChange = (
    file?: File
  ) => {
    if (!file) {
      return;
    }

    if (
      previewUrl?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(newPreviewUrl);
  };

  /* =======================================================
     RESET FORM
  ======================================================= */

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

    setForm(initialForm);

    setEditingProduct(null);

    setSelectedImage(null);

    setPreviewUrl(null);
  };

  /* =======================================================
     EDIT PRODUCT
  ======================================================= */

  const startEdit = (
    product: Product
  ) => {
    setEditingProduct(product);

    setForm({
      partNumber:
        product.partNumber ?? "",

      brand:
        product.brand ?? "",

      name:
        product.name ?? "",

      description:
        product.description ?? "",

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

    setPreviewUrl(
      product.imageUrl ?? null
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SUBMIT PRODUCT
  ======================================================= */

  const submitProduct =
    async () => {
      if (!supplierId) {
        alert(
          "Supplier ID not found.\n\nPlease sign out and log in again so your supplier ID can be loaded."
        );

        console.error(
          "submitProduct stopped because supplierId is undefined."
        );

        return;
      }

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
        !Number.isFinite(price) ||
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
          "Stock quantity must be a whole number and cannot be negative."
        );

        return;
      }

      setSaving(true);

      try {
        const data =
          new FormData();

        /**
         * Always send the actual Supplier.Id.
         */
        data.append(
          "SupplierId",
          supplierId
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

        /**
         * Keep the product active.
         */
        data.append(
          "IsActive",
          "true"
        );

        if (selectedImage) {
          data.append(
            "Image",
            selectedImage
          );
        }

        console.log(
          "Saving product..."
        );

        console.log(
          "SupplierId:",
          supplierId
        );

        if (editingProduct) {
          console.log(
            "Updating product:",
            editingProduct.id
          );

          await api.put(
            `/api/Products/${editingProduct.id}`,
            data
          );
        } else {
          console.log(
            "Creating new product..."
          );

          await api.post(
            "/api/Products/upload",
            data
          );
        }

        /**
         * Remember which operation succeeded
         * before resetForm clears editingProduct.
         */
        const wasEditing =
          Boolean(editingProduct);

        resetForm();

        /**
         * Reload from backend.
         */
        await loadProducts(
          supplierId
        );

        alert(
          wasEditing
            ? "Product updated successfully."
            : "Product added successfully."
        );
      } catch (error: unknown) {
        console.error(
          "Failed to save product:",
          error
        );

        const axiosError =
          error as {
            response?: {
              status?: number;

              data?:
                | {
                    message?: string;
                    title?: string;
                    detail?: string;
                  }
                | string;
            };

            message?: string;
          };

        const status =
          axiosError.response
            ?.status;

        const responseData =
          axiosError.response
            ?.data;

        console.error(
          "Status:",
          status
        );

        console.error(
          "Response:",
          responseData
        );

        let message =
          "Failed to save product.";

        if (
          typeof responseData ===
          "string"
        ) {
          message =
            responseData;
        } else if (
          responseData
        ) {
          message =
            responseData.message ??
            responseData.title ??
            responseData.detail ??
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

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const deleteProduct =
    async (
      product: Product
    ) => {
      if (!supplierId) {
        alert(
          "Supplier ID not found."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Delete ${product.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setLoading(true);

        await api.delete(
          `/api/Products/${product.id}/supplier/${supplierId}`
        );

        await loadProducts(
          supplierId
        );
      } catch (error) {
        console.error(
          "Failed to delete product:",
          error
        );

        alert(
          "Failed to delete product."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

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

          {/* DEVELOPMENT INFORMATION */}
          {supplierId && (
            <p className="mt-2 text-xs text-slate-500">
              Supplier ID:{" "}
              <span className="text-emerald-400">
                {supplierId}
              </span>
            </p>
          )}

          {!supplierId && (
            <p className="mt-2 text-xs text-yellow-500">
              Resolving supplier profile...
            </p>
          )}
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
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
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
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              placeholder="Brand"
              value={form.brand}
              onChange={(event) =>
                updateForm(
                  "brand",
                  event.target.value
                )
              }
            />

            {/* NAME */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 md:col-span-2"
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
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-bold file:text-black"
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
              className="min-h-28 rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 md:col-span-2"
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
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
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

            {/* STOCK */}
            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
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

          {/* BUTTONS */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">

            <button
              type="button"
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
                type="button"
                onClick={resetForm}
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
              type="button"
              onClick={() => {
                if (supplierId) {
                  void loadProducts(
                    supplierId
                  );
                }
              }}
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

          {/* NO SUPPLIER */}
          {!supplierId && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">

              <p className="font-bold">
                Resolving supplier profile...
              </p>

              <p className="mt-1 text-sm">
                The system is connecting your
                account to its supplier profile.
              </p>

            </div>
          )}

          {/* LOADING */}
          {supplierId &&
            loading &&
            products.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                Loading products...
              </div>
            )}

          {/* EMPTY */}
          {supplierId &&
            products.length === 0 &&
            !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                No products yet.
              </div>
            )}

          {/* PRODUCT CARDS */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {products.map(
              (product) => (

                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
                >

                  {/* IMAGE */}
                  {product.imageUrl ? (

                    <div className="relative h-44 w-full">

                      <Image
                        src={
                          product.imageUrl
                        }
                        alt={
                          product.name
                        }
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

                    {/* PART NUMBER */}
                    {product.partNumber && (
                      <p className="text-xs text-slate-500">
                        Part #:{" "}
                        {product.partNumber}
                      </p>
                    )}

                    {/* BRAND */}
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                      {product.brand}
                    </p>

                    {/* NAME */}
                    <h3 className="text-lg font-black">
                      {product.name}
                    </h3>

                    {/* DESCRIPTION */}
                    {product.description && (
                      <p className="line-clamp-2 text-sm text-slate-400">
                        {
                          product.description
                        }
                      </p>
                    )}

                    {/* PRICE / STOCK */}
                    <div className="flex items-center justify-between pt-3">

                      <p className="text-xl font-black text-emerald-400">
                        $
                        {Number(
                          product.price ||
                            0
                        ).toFixed(2)}
                      </p>

                      <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                        Stock:{" "}
                        {Number(
                          product.quantityAvailable ||
                            0
                        )}
                      </p>

                    </div>

                    {/* ACTIONS */}
                    <div className="grid grid-cols-2 gap-3 pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            product
                          )
                        }
                        className="rounded-xl bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-400"
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
                        disabled={
                          loading
                        }
                        className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}