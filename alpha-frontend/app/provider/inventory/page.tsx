"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
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

type AlphaUser = {
  id?: string;
  Id?: string;
  user_id?: string;
  userId?: string;

  supplierId?: string;
  SupplierId?: string;

  supplier?: {
    id?: string;
    Id?: string;
  };
};

type Supplier = {
  Id: string;
  user_id?: string;
  UserId?: string;
  Name?: string;
  name?: string;
};

type AxiosLikeError = {
  response?: {
    status?: number;
    data?:
      | string
      | {
          message?: string;
          title?: string;
          detail?: string;
        };
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

/* =========================================================
   AUTH / USER ID
   ========================================================= */

function getAlphaUser(): AlphaUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("alpha_user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AlphaUser;
  } catch (error) {
    console.error("Failed to parse alpha_user:", error);
    return null;
  }
}

function getUserId(): string | null {
  const user = getAlphaUser();

  if (!user) {
    return null;
  }

  const id =
    user.id ??
    user.Id ??
    user.user_id ??
    user.userId ??
    null;

  return id ? String(id).trim() : null;
}

function getStoredSupplierId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem("supplierId");

  return value?.trim() || null;
}

/*
 * useSyncExternalStore requires a stable subscription.
 */
function subscribeToAuth(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => {
    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener("alpha-user-changed", handleChange);
  window.addEventListener("supplier-id-changed", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("alpha-user-changed", handleChange);
    window.removeEventListener("supplier-id-changed", handleChange);
  };
}

function getAuthSnapshot() {
  return (
    getUserId() ??
    getStoredSupplierId() ??
    ""
  );
}

function getServerAuthSnapshot() {
  return "";
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function ProviderInventoryPage() {
  /*
   * This gives us the authenticated user's ID.
   *
   * IMPORTANT:
   *
   * This is NOT necessarily Suppliers.Id.
   *
   * Based on your database:
   *
   * users.id
   *      ↓
   * suppliers.user_id
   *      ↓
   * suppliers.Id
   */
  const authSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const userId = useMemo(() => {
    const user = getAlphaUser();

    if (!user) {
      return null;
    }

    const id =
      user.id ??
      user.Id ??
      user.user_id ??
      user.userId ??
      null;

    return id ? String(id).trim() : null;
  }, [authSnapshot]);

  /*
   * Supplier ID is stored separately once resolved.
   */
  const [supplierId, setSupplierId] =
    useState<string | null>(
      () => getStoredSupplierId()
    );

  const [products, setProducts] =
    useState<Product[]>([]);

  const [form, setForm] =
    useState<ProductForm>(initialForm);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  /* =========================================================
     FIND SUPPLIER BY USER ID
     ========================================================= */

  const resolveSupplier = useCallback(
    async (currentUserId: string): Promise<string | null> => {
      /*
       * If supplierId already exists, use it.
       */
      const stored = getStoredSupplierId();

      if (stored) {
        console.log(
          "Using stored Supplier ID:",
          stored
        );

        return stored;
      }

      console.log(
        "Resolving supplier using user ID:",
        currentUserId
      );

      /*
       * IMPORTANT:
       *
       * Your database structure shows:
       *
       * suppliers.user_id = authenticated user ID
       *
       * So the backend needs to expose:
       *
       * GET /api/Suppliers/user/{userId}
       *
       * returning the supplier record.
       */
      const response = await api.get<Supplier>(
        `/api/Suppliers/user/${encodeURIComponent(
          currentUserId
        )}`
      );

      const supplier = response.data;

      const resolvedId =
        supplier?.Id;

      if (!resolvedId) {
        console.error(
          "Supplier API returned no Id:",
          supplier
        );

        return null;
      }

      const id = String(resolvedId).trim();

      /*
       * Store it so future requests do not need
       * to resolve the supplier again.
       */
      localStorage.setItem(
        "supplierId",
        id
      );

      /*
       * Notify other components if necessary.
       */
      window.dispatchEvent(
        new Event("supplier-id-changed")
      );

      console.log(
        "Resolved Supplier ID:",
        id
      );

      return id;
    },
    []
  );

  /* =========================================================
     LOAD PRODUCTS
     ========================================================= */

  const loadProducts = useCallback(
    async (id: string) => {
      if (!id) {
        console.warn(
          "Cannot load products: Supplier ID is empty."
        );

        setProducts([]);
        return;
      }

      setLoading(true);

      try {
        console.log(
          "Loading products for Supplier ID:",
          id
        );

        const response =
          await api.get<Product[]>(
            `/api/Products/supplier/${encodeURIComponent(
              id
            )}`
          );

        console.log(
          "Products returned:",
          response.data
        );

        const productList =
          Array.isArray(response.data)
            ? response.data
            : [];

        setProducts(productList);
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

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  const initializeInventory = useCallback(
    async () => {
      if (!userId) {
        console.warn(
          "No authenticated user ID found."
        );

        return;
      }

      try {
        console.log(
          "Authenticated User ID:",
          userId
        );

        /*
         * Resolve:
         *
         * user.id
         *    ↓
         * suppliers.user_id
         *    ↓
         * suppliers.Id
         */
        const resolvedSupplierId =
          await resolveSupplier(userId);

        if (!resolvedSupplierId) {
          console.error(
            "Could not resolve Supplier ID."
          );

          setProducts([]);
          return;
        }

        setSupplierId(
          resolvedSupplierId
        );

        /*
         * Now load products using the actual
         * Suppliers.Id.
         */
        await loadProducts(
          resolvedSupplierId
        );
      } catch (error) {
        console.error(
          "Failed to initialize inventory:",
          error
        );

        setProducts([]);
      }
    },
    [
      userId,
      resolveSupplier,
      loadProducts,
    ]
  );

  /*
   * IMPORTANT:
   *
   * We don't use useEffect here because your ESLint
   * configuration specifically rejects synchronous
   * state updates originating from effects.
   *
   * The inventory is initialized from the page's
   * user interaction below as well as when the user
   * presses Refresh.
   */

  /* =========================================================
     REFRESH
     ========================================================= */

  const refreshInventory = async () => {
    /*
     * First use known supplier ID.
     */
    if (supplierId) {
      await loadProducts(supplierId);
      return;
    }

    /*
     * Otherwise resolve supplier from logged-in user.
     */
    await initializeInventory();
  };

  /* =========================================================
     SUMMARY
     ========================================================= */

  const totalInventoryValue = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum +
        Number(product.price || 0) *
          Number(
            product.quantityAvailable || 0
          ),
      0
    );
  }, [products]);

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

  /* =========================================================
     FORM
     ========================================================= */

  const updateForm = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =========================================================
     IMAGE
     ========================================================= */

  const handleImageChange = (
    file?: File
  ) => {
    if (!file) {
      return;
    }

    if (
      previewUrl?.startsWith("blob:")
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

  /* =========================================================
     RESET FORM
     ========================================================= */

  const resetForm = () => {
    if (
      previewUrl?.startsWith("blob:")
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

  /* =========================================================
     EDIT
     ========================================================= */

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
        String(product.price ?? ""),

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

  /* =========================================================
     SAVE PRODUCT
     ========================================================= */

  const submitProduct = async () => {
    /*
     * If supplier ID is missing, resolve it first.
     */
    let currentSupplierId =
      supplierId;

    if (!currentSupplierId) {
      if (!userId) {
        alert(
          "User ID not found. Please sign out and log in again."
        );

        return;
      }

      try {
        currentSupplierId =
          await resolveSupplier(
            userId
          );

        if (
          !currentSupplierId
        ) {
          alert(
            "Supplier profile could not be found for this account."
          );

          return;
        }

        setSupplierId(
          currentSupplierId
        );
      } catch (error) {
        console.error(
          "Failed to resolve supplier:",
          error
        );

        alert(
          "Could not find your supplier profile."
        );

        return;
      }
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

      /*
       * THIS IS THE CRITICAL VALUE.
       *
       * This must be:
       *
       * suppliers.Id
       *
       * NOT:
       *
       * users.id
       */
      data.append(
        "SupplierId",
        currentSupplierId
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

      if (selectedImage) {
        data.append(
          "Image",
          selectedImage
        );
      }

      console.log(
        "================================"
      );

      console.log(
        "Saving Product"
      );

      console.log(
        "User ID:",
        userId
      );

      console.log(
        "Supplier ID:",
        currentSupplierId
      );

      console.log(
        "Editing:",
        editingProduct?.id ??
          "NEW PRODUCT"
      );

      console.log(
        "================================"
      );

      if (editingProduct) {
        await api.put(
          `/api/Products/${editingProduct.id}`,
          data
        );
      } else {
        await api.post(
          "/api/Products/upload",
          data
        );
      }

      /*
       * IMPORTANT:
       *
       * Don't immediately assume the returned
       * product list is correct.
       *
       * Query the backend again.
       */
      resetForm();

      await loadProducts(
        currentSupplierId
      );

      alert(
        editingProduct
          ? "Product updated successfully."
          : "Product added successfully."
      );
    } catch (
      error: unknown
    ) {
      console.error(
        "Failed to save product:",
        error
      );

      const axiosError =
        error as AxiosLikeError;

      const status =
        axiosError.response
          ?.status;

      const responseData =
        axiosError.response
          ?.data;

      console.error(
        "HTTP Status:",
        status
      );

      console.error(
        "API Response:",
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

  /* =========================================================
     DELETE
     ========================================================= */

  const deleteProduct = async (
    product: Product
  ) => {
    if (!supplierId) {
      alert(
        "Supplier ID not found."
      );

      return;
    }

    const confirmed =
      confirm(
        `Delete ${product.name}?`
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      await api.delete(
        `/api/Products/${product.id}/supplier/${supplierId}`
      );

      /*
       * Reload from database.
       */
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

  /* =========================================================
     RENDER
     ========================================================= */

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
            Add, edit, or delete your
            products here.
          </p>

          {/* DEBUG INFORMATION */}
          <div className="mt-3 space-y-1 text-xs">
            <p className="text-slate-500">
              User ID:{" "}
              <span className="text-slate-400">
                {userId ??
                  "Not found"}
              </span>
            </p>

            <p className="text-slate-500">
              Supplier ID:{" "}
              <span className="text-emerald-400">
                {supplierId ??
                  "Not resolved"}
              </span>
            </p>
          </div>
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
              $
              {totalInventoryValue.toFixed(
                2
              )}
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
                    event.target
                      .files?.[0]
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

            <textarea
              className="min-h-28 rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400 md:col-span-2"
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

            <input
              className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none focus:border-emerald-400"
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

          <div className="mt-5 flex flex-col gap-3 md:flex-row">

            <button
              type="button"
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
              onClick={
                refreshInventory
              }
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {/* NO USER */}
          {!userId && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              <p className="font-bold">
                User ID not found.
              </p>

              <p className="mt-1 text-sm">
                Please sign out and log in
                again.
              </p>
            </div>
          )}

          {/* NO SUPPLIER */}
          {userId &&
            !supplierId && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">
                <p className="font-bold">
                  Supplier profile has not
                  been resolved yet.
                </p>

                <button
                  type="button"
                  onClick={
                    initializeInventory
                  }
                  disabled={loading}
                  className="mt-3 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black"
                >
                  {loading
                    ? "Finding Supplier..."
                    : "Load Supplier"}
                </button>
              </div>
            )}

          {/* LOADING */}
          {loading &&
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

                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                      {product.brand}
                    </p>

                    <h3 className="text-lg font-black">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="line-clamp-2 text-sm text-slate-400">
                        {
                          product.description
                        }
                      </p>
                    )}

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
                          deleteProduct(
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
              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}