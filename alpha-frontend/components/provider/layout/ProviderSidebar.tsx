"use client";

import Link from "next/link";
import { Package, ClipboardList, Warehouse, Truck, BarChart3, Settings } from "lucide-react";

export default function ProviderSidebar() {
  return (
    <aside className="w-64 bg-[#111827] text-white h-screen border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-xl font-bold">
          ALPHA PROVIDER
        </h1>
      </div>

      <nav className="space-y-2 px-3">

        <Link
          href="/dashboard"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1f2937]"
        >
          <BarChart3 size={20} />
          Dashboard
        </Link>

        <Link
          href="/orders"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1f2937]"
        >
          <ClipboardList size={20} />
          Orders
        </Link>

        <Link
          href="/products"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1f2937]"
        >
          <Package size={20} />
          Products
        </Link>

        <Link
          href="/inventory"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1f2937]"
        >
          <Warehouse size={20} />
          Inventory
        </Link>

        <Link
          href="/drivers"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1f2937]"
        >
          <Truck size={20} />
          Drivers
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1f2937]"
        >
          <Settings size={20} />
          Settings
        </Link>

      </nav>
    </aside>
  );
}