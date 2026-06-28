"use client";

import { useEffect, useState } from "react";
import { getMissionControlOverview } from "@/services/dashboard";
import FinancialOverviewCards from "@/components/dashboard/FinancialOverviewCards";
import {
  assignProvider,
  assignMechanic,
  assignDriver,
  getServiceRequests,
} from "@/services/serviceRequests";
import type {
  ServiceRequest,
  MissionControlOverview,
} from "@/types/serviceRequest";
export default function MissionControlDashboardPage() {
  const [overview, setOverview] = useState<MissionControlOverview | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  async function load() {
    const overviewData = await getMissionControlOverview();
    const requestData = await getServiceRequests();

    setOverview(overviewData);
    setRequests(requestData);
  }

  useEffect(() => {
  let active = true;

  async function fetchData() {
    const overviewData = await getMissionControlOverview();
    const requestData = await getServiceRequests();

    if (!active) return;

    setOverview(overviewData);
    setRequests(requestData);
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

async function runAction(action: () => Promise<unknown>) {
  await action();

  const overviewData = await getMissionControlOverview();
  const requestData = await getServiceRequests();

  setOverview(overviewData);
  setRequests(requestData);
}

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-6">
      <section>
        <p className="text-green-400 font-semibold uppercase tracking-wider">
          Alpha Mission Control
        </p>
        <h1 className="text-3xl font-bold mt-2">
          Service Operations Dashboard
        </h1>
      </section>

      <FinancialOverviewCards data={overview} />

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <h2 className="text-xl font-bold">Live Service Requests</h2>

        <div className="mt-5 space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl bg-[#0B0F14] border border-white/10 p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-bold">{request.customerName}</p>
                  <p className="text-gray-400 text-sm">
                    {request.vehicleInfo}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {request.issueDescription}
                  </p>
                  <p className="text-green-400 mt-2">
                    {request.status}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      runAction(() => assignProvider(request.id))
                    }
                    className="rounded-lg bg-blue-500 px-3 py-2 text-sm"
                  >
                    Assign Provider
                  </button>

                  <button
                    onClick={() =>
                      runAction(() => assignMechanic(request.id))
                    }
                    className="rounded-lg bg-purple-500 px-3 py-2 text-sm"
                  >
                    Assign Mechanic
                  </button>

                  <button
                    onClick={() =>
                      runAction(() => assignDriver(request.id))
                    }
                    className="rounded-lg bg-orange-500 px-3 py-2 text-sm"
                  >
                    Assign Driver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}