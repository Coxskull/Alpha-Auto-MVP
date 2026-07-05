"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSettlementQueue,
  markSettlementPaid,
  type SettlementItem,
} from "@/services/financials";

function money(value: number | string | null | undefined) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function statusClass(status: string) {
  if (status === "paid")
    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";

  if (status === "blocked")
    return "bg-red-500/10 text-red-300 border-red-500/20";

  if (status === "ready_for_payout")
    return "bg-blue-500/10 text-blue-300 border-blue-500/20";

  return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
}

export default function AdminFinancialsPage() {
  const [items, setItems] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

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
    try {
      setPayingId(id);
      await markSettlementPaid(id);
      await load();
    } finally {
      setPayingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Admin Payout Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tax-aware settlements, provider payables, and reconciliation status.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-white/10 p-6 text-slate-400">
          No settlement queue items found.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const financial = item.financial;

            const isBlocked =
              item.status === "blocked" ||
              financial?.payoutStatus === "blocked" ||
              financial?.financialStatus === "reconciliation_failed";

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900 border border-white/10 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold capitalize">{item.payeeType}</p>

                    <span
                      className={`inline-flex mt-2 rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                        isBlocked ? "blocked" : item.status
                      )}`}
                    >
                      {isBlocked ? "blocked" : item.status}
                    </span>

                    {item.payeeId && (
                      <p className="text-xs text-slate-500 mt-2">
                        Payee ID: {item.payeeId}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">Net Payable</p>
                    <p className="text-2xl font-black">{money(item.amount)}</p>
                  </div>
                </div>

                {financial && (
                  <div className="mt-5 rounded-xl bg-slate-950/70 border border-white/10 p-4">
                    <p className="font-bold text-sm mb-3">
                      Financial Breakdown
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Customer Paid</p>
                        <p className="font-bold">
                          {money(financial.customerPaid)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Tax Collected</p>
                        <p className="font-bold text-yellow-300">
                          {money(financial.taxCollected)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Tax Withheld</p>
                        <p className="font-bold text-orange-300">
                          {money(financial.taxWithheld)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Processing Fee</p>
                        <p className="font-bold">
                          {money(financial.processingFee)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Alpha Net Revenue</p>
                        <p className="font-bold text-emerald-300">
                          {money(financial.alphaNetRevenue)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Reconciliation Difference
                        </p>
                        <p
                          className={`font-bold ${
                            Number(financial.reconciliationDifference || 0) === 0
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {money(financial.reconciliationDifference)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                      <p>Financial Status: {financial.financialStatus}</p>
                      <p>Payout Status: {financial.payoutStatus}</p>
                      <p>Order ID: {financial.orderId || "N/A"}</p>
                    </div>
                  </div>
                )}

                {isBlocked && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                    Settlement is blocked because the financial record does not
                    reconcile. Review tax, payout, processing fee, or
                    customer-paid amounts first.
                  </div>
                )}

                {item.status !== "paid" && !isBlocked && (
                  <button
                    onClick={() => pay(item.id)}
                    disabled={payingId === item.id}
                    className="mt-4 w-full bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-300 text-black rounded-xl py-2 font-bold"
                  >
                    {payingId === item.id ? "Processing..." : "Mark as Paid"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}