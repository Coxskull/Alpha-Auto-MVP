"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSettlementQueue,
  markSettlementPaid,
  type SettlementItem,
} from "@/services/financials";

export default function AdminFinancialsPage() {
  const [items, setItems] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getSettlementQueue();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [load]);

  async function pay(id: string) {
    await markSettlementPaid(id);
    await load();
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-2xl font-black mb-6">Admin Payout Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900 border border-white/10 p-4"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-bold capitalize">{item.payeeType}</p>
                  <p className="text-sm text-slate-400">{item.status}</p>
                </div>

                <p className="font-black">
                  ${Number(item.amount || 0).toFixed(2)}
                </p>
              </div>

              {item.status !== "paid" && (
                <button
                  onClick={() => pay(item.id)}
                  className="mt-4 w-full bg-emerald-500 text-black rounded-xl py-2 font-bold"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}