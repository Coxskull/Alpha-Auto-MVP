"use client";

import { MapPin, Store } from "lucide-react";
import { Supplier } from "@/types/supplier";

export default function SupplierCard({ supplier }: { supplier: Supplier }) {
  const isAvailable =
    supplier.availabilityStatus?.toLowerCase() === "available";

  return (
    <div className="min-w-[260px] bg-[#0f172a] border border-white/10 rounded-3xl p-5">
      <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <Store size={22} />
      </div>

      <h3 className="font-bold text-white mt-4">
        {supplier.name || "Auto Parts Supplier"}
      </h3>

      <p className="text-sm text-slate-400 flex gap-2 mt-2">
        <MapPin size={16} />
        {supplier.address || "No address"}
      </p>

      <span
        className={`inline-flex mt-4 px-3 py-1 rounded-full text-xs font-bold ${
          isAvailable
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}
      >
        {supplier.availabilityStatus}
      </span>
    </div>
  );
}