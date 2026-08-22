"use client";

import { useEffect, useState } from "react";
import { getMySupplierEarnings } from "@/services/financials";

type SupplierEarning = {
  id: string;
  amount: number;
  currency?: string;
  financialStatus?: string;
  payoutStatus: string;
  createdAt?: string;
};

export default function SupplierEarningsPage() {
  const [items, setItems] = useState<SupplierEarning[]>([]);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const data = await getMySupplierEarnings();

        setItems(data.items);
      } catch (error) {
        console.error(
          "Failed to load supplier earnings:",
          error
        );
      }
    }

    loadEarnings();
  }, []);

  const total = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-2xl font-black mb-6">
        Supplier Earnings
      </h1>

      <div className="rounded-2xl bg-slate-900 p-5 mb-6">
        <p className="text-slate-400">
          Total Earnings
        </p>

        <p className="text-3xl font-black">
          ${total.toFixed(2)}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-slate-900 p-4"
          >
            <p className="font-bold">
              ${Number(item.amount || 0).toFixed(2)}
            </p>

            <p className="text-sm text-slate-400">
              {item.payoutStatus}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}