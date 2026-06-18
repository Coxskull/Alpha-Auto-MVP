"use client";

import { useState } from "react";
import Link from "next/link";

import BottomNavigation from "@/components/BottomNavigation";

import {
  CartItem,
  getCart,
  removeFromCart,
} from "@/services/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() =>
    getCart()
  );

  const handleRemove = (productId: string) => {
    removeFromCart(productId);

    setItems(getCart());
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <h1 className="text-3xl font-bold mb-6">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="bg-slate-900 p-6 rounded-xl">
          Cart is empty.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-900 rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">
                    {item.productName}
                  </h3>

                  <p className="text-slate-400">
                    Qty: {item.quantity}
                  </p>

                  <p className="text-green-400 font-semibold">
                    ₱{item.price}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleRemove(item.productId)
                  }
                  className="text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-slate-900 p-4 rounded-xl">
            <div className="flex justify-between">
              <span>Total</span>

              <span className="font-bold text-green-400">
                ₱{total.toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block mt-6 bg-green-600 hover:bg-green-500 text-center py-3 rounded-xl"
          >
            Proceed To Checkout
          </Link>
        </>
      )}

      <BottomNavigation />
    </main>
  );
}