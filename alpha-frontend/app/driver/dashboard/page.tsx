"use client";

import { useEffect, useState } from "react";
import {
  getMyDriverRequests,
  updateDriverStatus,
} from "@/services/serviceRequests";
import { getDriverDashboard } from "@/services/dashboard";
import { DriverDashboardStats, ServiceRequest } from "@/types/serviceRequest";

export default function DriverDashboardPage() {
const [requests, setRequests] = useState<ServiceRequest[]>([]);
const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  async function load() {
    setRequests(await getMyDriverRequests());
    setStats(await getDriverDashboard());
  }

useEffect(() => {
  let active = true;

  async function fetchData() {
    const requestData = await getMyDriverRequests();
    const statsData = await getDriverDashboard();

    if (!active) return;

    setRequests(requestData);
    setStats(statsData);
  }

  void fetchData();

  const timer = window.setInterval(() => {
    void fetchData();
  }, 15000);

  return () => {
    active = false;
    window.clearInterval(timer);
  };
}, []);

async function run(action: () => Promise<unknown>) {
  await action();

  const requestData = await getMyDriverRequests();
  const statsData = await getDriverDashboard();

  setRequests(requestData);
  setStats(statsData);
}

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Driver Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card label="Assigned" value={stats.jobs.assigned} />
          <Card label="Picked Up" value={stats.jobs.pickedUp} />
          <Card label="Delivered" value={stats.jobs.delivered} />
          <Card label="Completed" value={stats.jobs.completed} />
          <Card label="Earnings" value={`$${stats.financials.earnings}`} />
        </div>
      )}

      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-2xl bg-[#111827] border border-white/10 p-5"
        >
          <p className="font-bold">{request.customerName}</p>
          <p className="text-gray-400">{request.serviceAddress}</p>
          <p className="text-green-400 mt-2">{request.status}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() =>
                run(() =>
                  updateDriverStatus(request.id, "parts_picked_up")
                )
              }
              className="rounded-lg bg-blue-500 px-3 py-2"
            >
              Parts Picked Up
            </button>

            <button
              onClick={() =>
                run(() =>
                  updateDriverStatus(request.id, "parts_delivered")
                )
              }
              className="rounded-lg bg-green-500 px-3 py-2 text-black"
            >
              Parts Delivered
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}

function Card({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#111827] border border-white/10 p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}