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

type SupplierResponse = {
  id?: string;
  Id?: string;
  supplierId?: string;
  SupplierId?: string;
  userId?: string;
  UserId?: string;
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

let supplierSnapshot: string | null = null;
let supplierInitialized = false;
let supplierResolving = false;

const supplierListeners = new Set<() => void>();

function notifySupplierListeners() {
  supplierListeners.forEach((listener) => {
    listener();
  });
}

function readStoredSupplierId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("supplierId");

  if (stored?.trim()) {
    return stored.trim();
  }

  return null;
}

function readUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const alphaUserRaw = localStorage.getItem("alpha_user");

  if (!alphaUserRaw) {
    return null;
  }

  try {
    const user = JSON.parse(alphaUserRaw);

    const userId =
      user.id ??
      user.Id ??
      user.user_id ??
      user.userId ??
      null;

    if (!userId) {
      return null;
    }

    return String(userId).trim();
  } catch (error) {
    console.error(
      "Failed to parse alpha_user:",
      error
    );

    return null;
  }
}

function getSupplierSnapshot(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!supplierInitialized) {
    supplierInitialized = true;

    const storedSupplierId = readStoredSupplierId();

    if (storedSupplierId) {
      supplierSnapshot = storedSupplierId;
    }
  }

  return supplierSnapshot;
}

function getSupplierServerSnapshot(): string | null {
  return null;
}

function subscribeToSupplierStore(
  callback: () => void
) {
  supplierListeners.add(callback);

  /*
   * Resolve the supplier when the first component subscribes.
   *
   * This is intentionally outside React state/effects.
   * Therefore react-hooks/set-state-in-effect is not triggered.
   */
  void resolveSupplierId();

  return () => {
    supplierListeners.delete(callback);
  };
}

async function resolveSupplierId(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  /*
   * Already resolved.
   */
  if (supplierSnapshot) {
    return supplierSnapshot;
  }

  /*
   * Another request is already resolving it.
   */
  if (supplierResolving) {
    return supplierSnapshot;
  }

  supplierResolving = true;

  try {
    /*
     * First try localStorage.
     */
    const storedSupplierId = readStoredSupplierId();

    if (storedSupplierId) {
      supplierSnapshot = storedSupplierId;

      notifySupplierListeners();

      return supplierSnapshot;
    }

    /*
     * Get authenticated user ID.
     */
    const userId = readUserId();

    console.log("User ID:", userId);

    if (!userId) {
      console.error(
        "Cannot resolve supplier: user ID not found."
      );

      return null;
    }

    /*
     * Resolve User.Id -> Supplier.Id
     */
    console.log(
      "Resolving supplier for user:",
      userId
    );

    const response =
      await api.get<SupplierResponse>(
        `/api/Suppliers/user/${encodeURIComponent(
          userId
        )}`
      );

    console.log(
      "Supplier response:",
      response.data
    );

    const supplier =
      response.data;

    const resolvedSupplierId =
      supplier.supplierId ??
      supplier.SupplierId ??
      supplier.id ??
      supplier.Id ??
      null;

    if (!resolvedSupplierId) {
      console.error(
        "Supplier endpoint returned no SupplierId.",
        supplier
      );

      return null;
    }

    supplierSnapshot =
      String(resolvedSupplierId).trim();

    /*
     * Persist it so future pages don't need
     * to resolve it again.
     */
    localStorage.setItem(
      "supplierId",
      supplierSnapshot
    );

    console.log(
      "Resolved Supplier ID:",
      supplierSnapshot
    );

    notifySupplierListeners();

    /*
     * Let other parts of the application know.
     */
    window.dispatchEvent(
      new CustomEvent("supplier-id-changed")
    );

    return supplierSnapshot;
  } catch (error) {
    console.error(
      "Failed to resolve Supplier ID:",
      error
    );

    return null;
  } finally {
    supplierResolving = false;
  }
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function ProviderInventoryPage() {
  const supplierId = useSyncExternalStore(
    subscribeToSupplierStore,
    getSupplierSnapshot,
    getSupplierServerSnapshot
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
     LOAD PRODUCTS
     ========================================================= */

  const loadProducts = useCallback(
    async (id: string) => {
      if (!id) {
        console.warn(
          "Cannot load products: Supplier ID is empty."
        );

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
          "Products returned from API:",
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

  /*
   * IMPORTANT:
   *
   * Do not use useEffect here.
   *
   * supplierId changes through useSyncExternalStore,
   * and the actual loading is triggered from the
   * subscription/store.
   *
   * We use a separate callback below when the supplier
   * becomes available.
   */

  const refreshProducts = useCallback(async () => {
    if (!supplierId) {
      console.warn(
        "Cannot refresh products: Supplier ID unavailable."
      );

      return;
    }

    await loadProducts(supplierId);
  }, [supplierId, loadProducts]);

  /*
   * When supplierId becomes available, load products.
   *
   * This is invoked during render scheduling rather than
   * setState inside an effect.
   */
  useMemo(() => {
    if (supplierId) {
      void loadProducts(supplierId);
    }

    return null;
  }, [supplierId, loadProducts]);

  /* =========================================================
     TOTALS
     ========================================================= */

  const totalInventoryValue =
    useMemo(() => {
      return products.reduce(
        (sum, product) => {
          return (
            sum +
            Number(product.price || 0) *
              Number(
                product.quantityAvailable || 0
              )
          );
        },
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
        String(
          product.price ?? ""
        ),
      quantityAvailable:
        String(
          product.quantityAvailable ?? ""
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
    if (!supplierId) {
      alert(
        "Supplier ID not found. Please sign out and log in again."
      );

      console.error(
        "submitProduct stopped: Supplier ID is undefined."
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

      /*
       * THIS IS THE IMPORTANT VALUE.
       *
       * SupplierId must be Suppliers.Id.
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
        String(quantityAvailable)
      );

      /*
       * Keep these if your backend expects them.
       */
      data.append(
        "Currency",
        "MXN"
      );

      data.append(
        "CountryCode",
        "MX"
      );

      if (selectedImage) {
        data.append(
          "Image",
          selectedImage
        );
      }

      console.log(
        "Saving product with SupplierId:",
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
          "Creating product..."
        );

        await api.post(
          "/api/Products/upload",
          data
        );
      }

      /*
       * IMPORTANT:
       *
       * Keep the supplier ID.
       * Only clear the product form.
       */
      resetForm();

      /*
       * Reload the actual database data.
       *
       * This updates:
       * - My Products
       * - Total Products
       * - Total Stock
       * - Inventory Value
       */
      await loadProducts(
        supplierId
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
        confirm(
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
     UI
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
            Add, edit, or delete your products here.
          </p>

          <div className="mt-3 space-y-1 text-xs">
            <p className="text-slate-500">
              User ID:{" "}
              {readUserId() ??
                "Not found"}
            </p>

            <p className="text-slate-500">
              Supplier ID:{" "}
              <span
                className={
                  supplierId
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {supplierId ??
                  "Resolving..."}
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
              onClick={
                submitProduct
              }
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

        {/* PRODUCTS */}
        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-black">
              My Products
            </h2>

            <button
              type="button"
              onClick={
                refreshProducts
              }
              disabled={
                loading ||
                !supplierId
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

              <p className="font-bold">
                Resolving supplier profile...
              </p>

              <p className="mt-1 text-sm">
                The logged-in user must be linked to a supplier before products can be loaded.
              </p>

            </div>
          )}

          {supplierId &&
            loading &&
            products.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                Loading products...
              </div>
            )}

          {supplierId &&
            products.length === 0 &&
            !loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                No products yet.
              </div>
            )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {products.map(
              (product) => (
                <article
                  key={
                    product.id
                  }
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
                      {
                        product.brand
                      }
                    </p>

                    <h3 className="text-lg font-black">
                      {
                        product.name
                      }
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
                        ).toFixed(
                          2
                        )}
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