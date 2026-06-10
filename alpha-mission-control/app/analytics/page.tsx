"use client";

import { useEffect, useState } from "react";

import api from "@/services/api";

import { DashboardStats } from "@/types/dashboard";

export default function AnalyticsPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get(
        "/Dashboard/stats"
      );

      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

 useEffect(() => {
  const loadStats = async () => {
    await fetchStats();
  };

  loadStats();
}, []);

  if (!stats) {
    return (
      <div className="p-8 text-gray-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#070B11] min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">
        Analytics
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="bg-[#111827] p-6 rounded-3xl">
          <p className="text-gray-400">
            Live Orders
          </p>

          <h2 className="text-4xl text-white font-bold mt-3">
            {stats.liveOrders ?? 0}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-3xl">
          <p className="text-gray-400">
            Drivers Online
          </p>

          <h2 className="text-4xl text-white font-bold mt-3">
            {stats.driversOnline ?? 0}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-3xl">
          <p className="text-gray-400">
            Suppliers Active
          </p>

          <h2 className="text-4xl text-white font-bold mt-3">
            {stats.suppliersActive ?? 0}
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-3xl">
          <p className="text-gray-400">
            Delivered Today
          </p>

          <h2 className="text-4xl text-white font-bold mt-3">
            {stats.deliveredToday ?? 0}
          </h2>
        </div>
      </div>
    </div>
  );
}