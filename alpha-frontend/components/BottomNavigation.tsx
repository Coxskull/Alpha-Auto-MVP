"use client";

import Link from "next/link";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex justify-around items-center">
      <Link href="/">Home</Link>
      <Link href="/orders">Orders</Link>
      <Link href="/garage">Garage</Link>
      <Link href="/account">Account</Link>
    </div>
  );
}