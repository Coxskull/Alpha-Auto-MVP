"use client";

import Link from "next/link";
import { Home, ClipboardList, Car, User, ShoppingCart } from "lucide-react";

export default function BottomNavigation({
  cartCount = 0,
}: {
  cartCount?: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#020617]/95 backdrop-blur border-t border-white/10">
      <div className="max-w-md mx-auto h-20 flex justify-around items-center text-xs text-slate-400">
        <Link href="/" className="flex flex-col items-center gap-1">
          <Home size={22} />
          Home
        </Link>

        <Link href="/cart" className="relative flex flex-col items-center gap-1 text-emerald-400">
          <ShoppingCart size={22} />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 right-2 bg-emerald-500 text-black text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <Link href="/orders" className="flex flex-col items-center gap-1">
          <ClipboardList size={22} />
          Orders
        </Link>

        <Link href="/garage" className="flex flex-col items-center gap-1">
          <Car size={22} />
          Garage
        </Link>

        <Link href="/account" className="flex flex-col items-center gap-1">
          <User size={22} />
          Account
        </Link>
      </div>
    </div>
  );
}