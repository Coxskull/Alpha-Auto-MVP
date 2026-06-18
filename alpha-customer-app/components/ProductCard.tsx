"use client";

import { Product } from "@/types/product";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: Props) {
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">
        <p className="text-xs text-gray-400">
          {product.brand}
        </p>

        <h3 className="text-white font-semibold">
          {product.name}
        </h3>

        <p className="text-green-400 font-bold mt-2">
          ₱{product.price}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-xl"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}