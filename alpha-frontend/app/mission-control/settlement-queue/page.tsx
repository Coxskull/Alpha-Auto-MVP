"use client";

import { useEffect, useState } from "react";
import {
  getSettlementQueue,
  markSettlementPaid,
  type SettlementItem,
} from "@/services/financials";

export default function SettlementQueuePage() {
  const [items, setItems] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getSettlementQueue();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
  let mounted = true;

  async function fetchData() {
    const data = await getSettlementQueue();

    if (mounted) {
      setItems(data);
      setLoading(false);
    }
  }

  fetchData();

  return () => {
    mounted = false;
  };
}, []);

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-black mb-2">Settlement Queue</h1>
      <p className="text-slate-400 mb-6">
        Manual payout review queue. No automatic payouts yet.
      </p>

      {loading ? (
        <p>Loading settlements...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="p-3 text-left">Payee</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="p-3 capitalize">{item.payeeType}</td>
                  <td className="p-3 font-bold">
                    ${Number(item.amount || 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-300">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    {item.status !== "paid" && (
                      <button
                        onClick={async () => {
                          await markSettlementPaid(item.id);
                          await load();
                        }}
                        className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-black"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}