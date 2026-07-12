"use client";

import { Plus, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const stock = Number(product.quantityAvailable ?? 0);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg">
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-b from-slate-50 to-white p-3 sm:h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || "/placeholder-part.png"}
          alt={product.name}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-700 shadow-sm ring-1 ring-slate-200">
          {product.brand || "Part"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-slate-900 sm:text-[15px]">
          {product.name}
        </p>

        {product.partNumber && (
          <p className="mt-1 truncate text-[11px] text-slate-400">Part no. {product.partNumber}</p>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-black text-slate-950">${Number(product.price).toFixed(2)}</p>
            <p className={`text-[11px] font-bold ${stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {stock > 0 ? "In Stock" : "Out of Stock"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={stock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={stock <= 0}
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-2.5 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:flex"
        >
          <ShoppingCart size={15} />
          Add to cart
        </button>
      </div>
    </article>
  );
}
