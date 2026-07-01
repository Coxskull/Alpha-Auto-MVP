"use client";

import { useEffect, useState } from "react";
import { getDriverWallet } from "@/services/financials";

type WalletItem = {
  id: string;
  amount: number;
  payoutStatus: string;
  financialStatus?: string;
  createdAt?: string;
};

type DriverWallet = {
  totalEarned: number;
  pending: number;
  items: WalletItem[];
};

export default function DriverWalletPage() {
  const [wallet, setWallet] = useState<DriverWallet | null>(null);

  useEffect(() => {
    const driverId = localStorage.getItem("driverId") || "";

    if (!driverId) return;

    const timeout = window.setTimeout(() => {
      getDriverWallet(driverId).then((data: DriverWallet) => {
        setWallet(data);
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!wallet) {
    return <main className="p-6 text-white">Loading wallet...</main>;
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-2xl font-black mb-6">Driver Wallet</h1>

      <div className="grid gap-4">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400">Total Earned</p>
          <p className="text-3xl font-black">
            ${Number(wallet.totalEarned || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400">Pending Payout</p>
          <p className="text-3xl font-black">
            ${Number(wallet.pending || 0).toFixed(2)}
          </p>
        </div>

        {wallet.items.map((item) => (
          <div key={item.id} className="rounded-xl bg-slate-900 p-4">
            <p className="font-bold">
              ${Number(item.amount || 0).toFixed(2)}
            </p>
            <p className="text-sm text-slate-400">{item.payoutStatus}</p>
          </div>
        ))}
      </div>
    </main>
  );
}