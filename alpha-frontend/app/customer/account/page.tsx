"use client";

import BottomNavigation from "@/components/BottomNavigation";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white pb-24 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black mb-6">Account</h1>

        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
          <div className="h-16 w-16 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-xl">
            A
          </div>

          <h2 className="font-bold mt-4">Alpha Customer</h2>

          <p className="text-slate-400 text-sm">
            customer@alpha.app
          </p>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}