"use client";

import { useEffect, useState } from "react";

import api from "@/services/api";

import { Driver } from "@/types/dashboard";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/api/Drivers");

      setDrivers(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch drivers",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadDrivers = async () => {
    await fetchDrivers();
  };

  loadDrivers();
}, []);

  return (
    <div className="p-8 bg-[#070B11] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          Drivers
        </h1>

        <p className="text-gray-400 mt-2">
          Driver fleet management
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">
          Loading drivers...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-[#111827] rounded-3xl p-6 border border-white/5"
            >
              <h2 className="text-white text-xl font-bold">
                {driver.fullName}
              </h2>

              <p className="text-gray-400 mt-2">
                Vehicle: {driver.vehicleType}
              </p>

              <div className="mt-4">
                <span className="px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-400 border border-green-500/20">
                  {driver.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}