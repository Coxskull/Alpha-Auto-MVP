"use client";

import BottomNavigation from "@/components/BottomNavigation";

export default function GaragePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white pb-24 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black mb-6">My Garage</h1>

        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
          <p className="text-slate-400">
            Add your vehicle here soon.
          </p>

          <button className="mt-5 w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl">
            Add Vehicle
          </button>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}