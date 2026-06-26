// components/mechanic/MechanicApp.tsx
"use client";

import Link from "next/link";

export default function MechanicApp({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <aside className="hidden w-64 border-r border-white/10 bg-[#111827] p-5 lg:block">
        <h1 className="text-xl font-bold text-green-400">ALPHA MECHANIC</h1>

        <nav className="mt-8 space-y-3">
          <Link href="/mechanic/dashboard" className="block rounded-xl p-3 hover:bg-white/10">
            Dashboard
          </Link>

          <Link href="/mechanic/jobs" className="block rounded-xl p-3 hover:bg-white/10">
            Jobs
          </Link>

          <Link href="/mechanic/history" className="block rounded-xl p-3 hover:bg-white/10">
            History
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="border-b border-white/10 bg-[#111827] p-5">
          <h2 className="font-bold">Mechanic Panel</h2>
        </header>

        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}