"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function getImageUrl(imageUrl?: string) {
  if (!imageUrl) return "/placeholder-part.png";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div className="relative h-40 w-full">
        <Image
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />

        <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
          {product.brand}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>

        <p className="text-xs text-slate-400 mt-1">In stock</p>

        <p className="text-emerald-400 font-black text-lg mt-3">
          ${Number(product.price).toFixed(2)}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Add
        </button>
      </div>
    </div>
  );
}