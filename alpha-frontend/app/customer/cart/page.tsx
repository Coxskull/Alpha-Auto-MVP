"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import BottomNavigation from "@/components/BottomNavigation";

type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

function getCartSnapshot() {
  if (typeof window === "undefined") return [];

  return JSON.parse(
    localStorage.getItem("cart") || "[]"
  ) as CartItem[];
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cart-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cart-updated", callback);
  };
}

export default function CartPage() {
  const cart = useSyncExternalStore(
    subscribe,
    getCartSnapshot,
    () => []
  );

  function removeItem(productId: string) {
    const updated = cart.filter(
      (item) => item.productId !== productId
    );

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );

    window.dispatchEvent(new Event("cart-updated"));
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-24 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black mb-6">
          My Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-[#0f172a] rounded-3xl p-6 text-center">
            <p className="text-slate-400">
              Your cart is empty.
            </p>

            <Link
              href="/customer"
              className="mt-5 inline-block bg-emerald-500 text-black font-bold px-5 py-3 rounded-2xl"
            >
              Browse Parts
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 flex gap-4"
                >
                  <img
                    src={
                      item.imageUrl ||
                      "/placeholder-part.png"
                    }
                    alt={item.productName}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="font-bold">
                      {item.productName}
                    </h2>

                    <p className="text-emerald-400 font-bold">
                      ${Number(item.price).toFixed(2)}
                    </p>

                    <p className="text-sm text-slate-400">
                      Qty: {item.quantity}
                    </p>

                    <button
                      onClick={() =>
                        removeItem(item.productId)
                      }
                      className="text-red-400 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-[#0f172a] rounded-3xl p-5 border border-white/10">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Link
                href="/customer/checkout"
                className="mt-5 block text-center bg-emerald-500 text-black font-bold py-4 rounded-2xl"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>

      <BottomNavigation cartCount={cart.length} />
    </main>
  );
}