"use client";

import { useEffect, useState } from "react";
import {
  getMyMechanicRequests,
  mechanicAccept,
  requestParts,
  startRepair,
  uploadRepairProof,
  completeServiceRequest,
} from "@/services/serviceRequests";
import { getMechanicDashboard } from "@/services/dashboard";
import type {
  ServiceRequest,
  MechanicDashboardStats,
} from "@/types/serviceRequest";

export default function MechanicDashboardPage() {
const [requests, setRequests] = useState<ServiceRequest[]>([]);
const [stats, setStats] = useState<MechanicDashboardStats | null>(null);

  async function load() {
    setRequests(await getMyMechanicRequests());
    setStats(await getMechanicDashboard());
  }

 useEffect(() => {
  let active = true;

  async function fetchData() {
    const requestData = await getMyMechanicRequests();
    const statsData = await getMechanicDashboard();

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

  const requestData = await getMyMechanicRequests();
  const statsData = await getMechanicDashboard();

  setRequests(requestData);
  setStats(statsData);
}

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Mechanic Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card label="Assigned" value={stats.jobs.assigned} />
          <Card label="Accepted" value={stats.jobs.accepted} />
          <Card label="Waiting Parts" value={stats.jobs.waitingForParts} />
          <Card label="Completed" value={stats.jobs.completed} />
          <Card label="Earnings" value={`$${stats.financials.earnings}`} />
        </div>
      )}

      <section className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-2xl bg-[#111827] border border-white/10 p-5"
          >
            <p className="font-bold">{request.customerName}</p>
            <p className="text-gray-400">{request.vehicleInfo}</p>
            <p className="text-gray-400">{request.issueDescription}</p>
            <p className="text-green-400 mt-2">{request.status}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => run(() => mechanicAccept(request.id))}
                className="bg-green-500 rounded-lg px-3 py-2 text-black"
              >
                Accept
              </button>

              <button
                onClick={() =>
                  run(() =>
                    requestParts(
                      request.id,
                      "Parts needed for repair",
                      "Please source required parts."
                    )
                  )
                }
                className="bg-yellow-500 rounded-lg px-3 py-2 text-black"
              >
                Request Parts
              </button>

              <button
                onClick={() => run(() => startRepair(request.id))}
                className="bg-blue-500 rounded-lg px-3 py-2"
              >
                Start Repair
              </button>

              <button
                onClick={() =>
                  run(() =>
                    uploadRepairProof(
                      request.id,
                      "https://placehold.co/600x400",
                      "Repair completed."
                    )
                  )
                }
                className="bg-purple-500 rounded-lg px-3 py-2"
              >
                Upload Proof
              </button>

              <button
                onClick={() =>
                  run(() =>
                    completeServiceRequest(
                      request.id,
                      request.finalAmount || 100
                    )
                  )
                }
                className="bg-green-600 rounded-lg px-3 py-2"
              >
                Complete
              </button>
            </div>
          </div>
        ))}
      </section>
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