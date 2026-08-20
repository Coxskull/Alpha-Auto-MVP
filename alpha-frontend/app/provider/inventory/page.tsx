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

function getErrorMessage(error: unknown): string {
  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
          title?: string;
          error?: string;
        };
      };
      message?: string;
    }
  )?.response;

  return (
    response?.data?.message ||
    response?.data?.title ||
    response?.data?.error ||
    (error instanceof Error
      ? error.message
      : "An unexpected error occurred.")
  );
}

export default function ProviderInventoryPage() {
  const [identity] = useState<StoredIdentity>(() =>
    getStoredIdentity()
  );

  const userId = identity.userId;

  const [supplierId, setSupplierId] = useState<string | null>(
    identity.supplierId
  );

  const ownerId = supplierId || userId;

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(
    async (id: string, byUserId = false) => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = byUserId
          ? `/api/Products/supplier/user/${id}`
          : `/api/Products/supplier/${id}`;

        const response = await api.get<Product[]>(endpoint);

        const loadedProducts = Array.isArray(response.data)
          ? response.data
          : [];

        setProducts(loadedProducts);

        const resolvedSupplierId =
          loadedProducts.find(
            (product) =>
              typeof product.supplierId === "string" &&
              product.supplierId.trim().length > 0
          )?.supplierId?.trim() || null;

        if (resolvedSupplierId) {
          setSupplierId(resolvedSupplierId);

          if (typeof window !== "undefined") {
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
        setError(getErrorMessage(requestError));

        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!userId) {
      setTimeout(() => {
        setLoading(false);
      }, 0);

      return;
    }

    let cancelled = false;

    const initializeInventory = async () => {
      try {
        const loadedProducts = await api.get<Product[]>(
          `/api/Products/supplier/user/${userId}`
        );

        if (cancelled) {
          return;
        }

        const productList = Array.isArray(
          loadedProducts.data
        )
          ? loadedProducts.data
          : [];

        setProducts(productList);

        const resolvedSupplierId =
          productList.find(
            (product) =>
              typeof product.supplierId === "string" &&
              product.supplierId.trim().length > 0
          )?.supplierId?.trim() || null;

        if (resolvedSupplierId) {
          setSupplierId(resolvedSupplierId);

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "supplierId",
              resolvedSupplierId
            );
          }
        }

        setError(null);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to initialize inventory:",
          requestError
        );

        setProducts([]);
        setError(getErrorMessage(requestError));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void initializeInventory();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [userId]);

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum + Number(product.quantityAvailable || 0),
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

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
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
      price: String(product.price ?? ""),
      quantityAvailable: String(
        product.quantityAvailable ?? ""
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

    if (!Number.isFinite(price) || price <= 0) {
      alert("Price must be greater than 0.");
      return;
    }

    if (
      !Number.isInteger(quantityAvailable) ||
      quantityAvailable < 0
    ) {
      alert(
        "Stock quantity must be a whole number greater than or equal to 0."
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = new FormData();

      data.append("SupplierId", ownerId);
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
      data.append("Currency", "PHP");
      data.append("CountryCode", "PH");

      if (selectedImage) {
        data.append("Image", selectedImage);
      }

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

      resetForm();

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
    } catch (requestError) {
      console.error(
        "Failed to save product:",
        requestError
      );

      const message =
        getErrorMessage(requestError);

      setError(message);

      alert(
        `Failed to save product.\n\n${message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (
    product: Product
  ) => {
    const actualSupplierId =
      supplierId || product.supplierId || null;

    if (!actualSupplierId) {
      alert(
        "Supplier ID was not found. Please refresh the inventory first."
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
        `/api/Products/${product.id}/supplier/${actualSupplierId}`
      );

      setProducts((previous) =>
        previous.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (requestError) {
      console.error(
        "Failed to delete product:",
        requestError
      );

      const message =
        getErrorMessage(requestError);

      setError(message);

      alert(
        `Failed to delete product.\n\n${message}`
      );
    }
  };

  const formatMoney = (
    value: number,
    currency = "PHP"
  ) => {
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `₱${value.toFixed(2)}`;
    }
  };

  const inventoryCurrency =
    products.find(
      (product) => product.currency
    )?.currency || "PHP";

  const refreshProducts = async () => {
    if (supplierId) {
      await loadProducts(
        supplierId,
        false
      );
      return;
    }

    if (userId) {
      await loadProducts(
        userId,
        true
      );
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

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

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
              value={form.description}
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
              value={form.quantityAvailable}
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
              onClick={() =>
                void submitProduct()
              }
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

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">
              My Products
            </h2>

            <button
              onClick={() =>
                void refreshProducts()
              }
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

          {!ownerId && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              Supplier account information was not
              found. Please log out and log in again.
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
              Loading products...
            </div>
          )}

          {ownerId &&
            !loading &&
            products.length === 0 && (
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
                      {formatMoney(
                        Number(product.price),
                        product.currency ||
                          "PHP"
                      )}
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