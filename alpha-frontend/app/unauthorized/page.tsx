// app/unauthorized/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <h1 className="text-3xl font-bold text-red-400">
          Access Blocked
        </h1>

        <p className="mt-4 text-gray-300">
          Your account does not have permission to access this page.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          Go Back
        </button>
      </div>
    </main>
  );
}