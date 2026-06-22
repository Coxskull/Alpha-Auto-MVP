"use client";

import { useState } from "react";

export default function DriverSettingsPage() {
  const [online, setOnline] = useState(true);

  return (
    <div className="min-h-screen bg-[#020617] p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">
        Driver Settings
      </h1>

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <p className="text-gray-400">
            Driver Name
          </p>

          <p className="text-white font-bold">
            Test Driver
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Vehicle
          </p>

          <p className="text-white font-bold">
            Motorcycle
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Territory
          </p>

          <p className="text-white font-bold">
            Monterrey
          </p>
        </div>

        <button
          onClick={() => setOnline(!online)}
          className={`px-5 py-3 rounded-xl font-bold ${
            online
              ? "bg-green-500 text-black"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {online
            ? "Online"
            : "Offline"}
        </button>
      </div>
    </div>
  );
}