"use client";

import { ChevronRight, MapPin, Star, Store } from "lucide-react";
import { Supplier } from "@/types/supplier";

export default function SupplierCard({ supplier }: { supplier: Supplier }) {
  const isAvailable = supplier.availabilityStatus?.toLowerCase() === "available";

  return (
    <article className="min-w-[220px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:min-w-[245px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <Store size={21} />
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {isAvailable ? "Online" : supplier.availabilityStatus || "Offline"}
        </span>
      </div>

      <h3 className="mt-4 truncate text-sm font-black text-slate-950">
        {supplier.name || "Auto Parts Supplier"}
      </h3>

      <p className="mt-2 flex min-h-9 items-start gap-1.5 text-xs leading-4 text-slate-500">
        <MapPin className="mt-0.5 shrink-0 text-violet-600" size={14} />
        <span className="line-clamp-2">{supplier.address || supplier.territory || "Location unavailable"}</span>
      </p>

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-600">
        <Star size={14} className="fill-amber-400 text-amber-400" />
        <strong>4.8</strong>
        <span className="text-slate-400">• Delivery in 35 min</span>
      </div>

      <button type="button" className="mt-4 flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:text-emerald-800">
        View Store <ChevronRight size={14} />
      </button>
    </article>
  );
}
