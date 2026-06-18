"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 bg-green-700 text-white">
      <div className="flex items-center justify-between px-4 py-3">

        <button>
          ☰
        </button>

        <Link href="/">
          <div>
            <h1 className="font-bold text-xl">
              ALPHA
            </h1>

            <p className="text-xs">
              We bring the parts.
            </p>
          </div>
        </Link>

        <Link href="/cart">
          <div className="relative">
            🛒

            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              2
            </span>
          </div>
        </Link>

      </div>
    </header>
  );
}