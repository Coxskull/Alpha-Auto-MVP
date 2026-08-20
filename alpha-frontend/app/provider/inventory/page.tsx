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
  isActive?: boolean;
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

const initialForm: ProductForm = {
  partNumber: "",
  brand: "",
  name: "",
  description: "",
  price: "",
  quantityAvailable: "",
};

/**
 * Read the authenticated user's IDs synchronously.
 *
 * Important:
 * - supplierId is preferred.
 * - userId is used as a fallback.
 *
 * The backend ProductsController already supports:
 * GET /api/Products/supplier/user/{userId}
 *
 * and UploadProduct / UpdateProduct can resolve SupplierId
 * using either Supplier.Id or Supplier.UserId.
 */
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
      supplierId?: string | null;
      SupplierId?: string | null;
      providerId?: string | null;
      ProviderId?: string | null;
    };

    const userId =
      user.id?.trim() ||
      user.Id?.trim() ||
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
  } catch (error) {
    console.error(
      "Failed to parse alpha_user:",
      error
    );

    return {
      supplierId: storedSupplierId,
      userId: null,
    };
  }
}

export default function ProviderInventoryPage() {
  /**
   * Read identity once during initial render.
   *
   * This intentionally does NOT use:
   *
   * useEffect(() => {
   *   setSupplierId(...)
   * }, []);
   *
   * That pattern is what triggered react-hooks/set-state-in-effect.
   */
  const [identity] = useState<StoredIdentity>(() =>
    getStoredIdentity()
  );

  const supplierId = identity.supplierId;
  const userId = identity.userId;

  /**
   * The value used when creating/updating products.
   *
   * If supplierId exists, use the real Supplier.Id.
   * Otherwise use userId because the backend resolves
   * Supplier.UserId as a fallback.
   */
  const ownerId = supplierId || userId;

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [form, setForm] =
    useState<ProductForm>(initialForm);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  /**
   * Start loading only when we actually have an identity.
   */
  const [loading, setLoading] = useState(
    Boolean(ownerId)
  );

  const [saving, setSaving] = useState(false);

  /**
   * ------------------------------------------------------
   * LOAD PRODUCTS
   * ------------------------------------------------------
   *
   * This function is used by buttons and after CRUD operations.
   *
   * It is NOT called from useEffect.
   *
   * That is important for the React compiler ESLint rule.
   */
  const loadProducts = useCallback(
    async (id: string, byUserId = false) => {
      setLoading(true);

      try {
        const endpoint = byUserId
          ? `/api/Products/supplier/user/${id}`
          : `/api/Products/supplier/${id}`;

        console.log(
          `Loading inventory using ${
            byUserId ? "userId" : "supplierId"
          }:`,
          id
        );

        const res = await api.get<Product[]>(
          endpoint
        );

        setProducts(
          Array.isArray(res.data)
            ? res.data
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

  /**
   * ------------------------------------------------------
   * INITIAL INVENTORY LOAD
   * ------------------------------------------------------
   *
   * We deliberately do not call loadProducts() here.
   *
   * Calling a function containing setState directly from
   * an effect is what React's set-state-in-effect rule
   * complained about.
   *
   * Instead, the async operation itself is defined inside
   * the effect and state is updated only after the external
   * API operation resolves.
   */
  useEffect(() => {
    if (!ownerId) {
      return;
    }

    let cancelled = false;

    async function fetchInventory() {
      try {
        const endpoint = supplierId
          ? `/api/Products/supplier/${supplierId}`
          : userId
            ? `/api/Products/supplier/user/${userId}`
            : null;

        if (!endpoint) {
          return;
        }

        console.log(
          "Loading inventory:",
          endpoint
        );

        const res = await api.get<Product[]>(
          endpoint
        );

        if (cancelled) {
          return;
        }

        setProducts(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load inventory:",
          error
        );

        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInventory();

    return () => {
      cancelled = true;
    };
  }, [ownerId, supplierId, userId]);

  /**
   * ------------------------------------------------------
   * INVENTORY CALCULATIONS
   * ------------------------------------------------------
   */

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum +
        Number(product.quantityAvailable || 0),
      0
    );
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum +
        Number(product.price || 0) *
          Number(product.quantityAvailable || 0),
      0
    );
  }, [products]);

  /**
   * ------------------------------------------------------
   * FORM
   * ------------------------------------------------------
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
   * ------------------------------------------------------
   * IMAGE
   * ------------------------------------------------------
   */

  const handleImageChange = (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setSelectedImage(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  };

  /**
   * ------------------------------------------------------
   * RESET FORM
   * ------------------------------------------------------
   */

  const resetForm = () => {
    setForm(initialForm);
    setEditingProduct(null);
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  /**
   * ------------------------------------------------------
   * EDIT
   * ------------------------------------------------------
   */

  const startEdit = (product: Product) => {
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
        String(product.price ?? ""),
      quantityAvailable:
        String(
          product.quantityAvailable ?? ""
        ),
    });

    setSelectedImage(null);

    setPreviewUrl(
      product.imageUrl || null
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * ------------------------------------------------------
   * CREATE / UPDATE PRODUCT
   * ------------------------------------------------------
   */

  const submitProduct = async () => {
    if (!ownerId) {
      alert(
        "Supplier account information was not found. Please log in again."
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
        "Stock quantity must be a whole number greater than or equal to 0."
      );
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      /**
       * Backend supports Supplier.Id OR Supplier.UserId.
       *
       * Therefore ownerId can safely be either one.
       */
      data.append(
        "SupplierId",
        ownerId
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

      /**
       * Keep the same defaults used by the backend.
       */
      data.append(
        "Currency",
        "PHP"
      );

      data.append(
        "CountryCode",
        "PH"
      );

      if (selectedImage) {
        data.append(
          "Image",
          selectedImage
        );
      }

      if (editingProduct) {
        /**
         * UpdateProduct also supports resolving the
         * supplier using Id OR UserId.
         */
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

      resetForm();

      /**
       * Refresh through the real supplier endpoint
       * when possible.
       */
      if (supplierId) {
        await loadProducts(
          supplierId,
          false
        );
      } else if (userId) {
        await loadProducts(
          userId,
          true
        );
      }
    } catch (error) {
      console.error(
        "Failed to save product:",
        error
      );

      alert(
        "Failed to save product. Please check the form and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * ------------------------------------------------------
   * DELETE
   * ------------------------------------------------------
   *
   * The backend delete endpoint currently requires the
   * actual Supplier.Id. Therefore this operation requires
   * supplierId, not merely userId.
   */
  const deleteProduct = async (
    product: Product
  ) => {
    if (!supplierId) {
      alert(
        "Supplier ID was not found. Please log in again."
      );
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

      setProducts((prev) =>
        prev.filter(
          (item) =>
            item.id !== product.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      alert(
        "Failed to delete product."
      );
    }
  };

  /**
   * ------------------------------------------------------
   * CURRENCY
   * ------------------------------------------------------
   */

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
      return `₱${value.toFixed(2)}`;
    }
  };

  const inventoryCurrency =
    products.find(
      (product) => product.currency
    )?.currency || "PHP";

  /**
   * ------------------------------------------------------
   * RENDER
   * ------------------------------------------------------
   */

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

          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p>
              User ID:{" "}
              {userId || "not available"}
            </p>

            <p>
              Supplier ID:{" "}
              {supplierId || "resolved through user ID"}
            </p>
          </div>
        </div>

        {/* SUMMARY */}

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
              {formatMoney(
                totalInventoryValue,
                inventoryCurrency
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
                saving || !ownerId
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
              onClick={() => {
                if (supplierId) {
                  void loadProducts(
                    supplierId,
                    false
                  );
                } else if (userId) {
                  void loadProducts(
                    userId,
                    true
                  );
                }
              }}
              disabled={
                loading || !ownerId
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {/* NO ID */}

          {!ownerId && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              Supplier account information was
              not found. Please log out and log
              in again.
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
              Loading products...
            </div>
          )}

          {/* EMPTY */}

          {ownerId &&
            !loading &&
            products.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                No products yet.
              </div>
            )}

          {/* PRODUCT GRID */}

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
                        {
                          product.description
                        }
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3">

                      <p className="text-xl font-black text-emerald-400">
                        {formatMoney(
                          Number(
                            product.price
                          ),
                          product.currency ||
                            "PHP"
                        )}
                      </p>

                      <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">
                        Stock:{" "}
                        {
                          product.quantityAvailable
                        }
                      </p>

                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">

                      <button
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
              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}