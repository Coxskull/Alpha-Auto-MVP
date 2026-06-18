"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">

      <div className="grid grid-cols-4">

        <Link
          href="/"
          className="text-center py-3"
        >
          🏠
          <div className="text-xs">
            Home
          </div>
        </Link>

        <Link
          href="/orders"
          className="text-center py-3"
        >
          📦
          <div className="text-xs">
            Orders
          </div>
        </Link>

        <Link
          href="/garage"
          className="text-center py-3"
        >
          🚗
          <div className="text-xs">
            Garage
          </div>
        </Link>

        <Link
          href="/account"
          className="text-center py-3"
        >
          👤
          <div className="text-xs">
            Account
          </div>
        </Link>

      </div>

    </nav>
  );
}