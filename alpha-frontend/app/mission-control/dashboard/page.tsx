"use client";

import { useEffect, useState } from "react";
import ActiveOrdersTable from "@/components/dashboard/ActiveOrdersTable";
import FinancialOverviewCards from "@/components/dashboard/FinancialOverviewCards";
import { getMissionControlOverview } from "@/services/dashboard";
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

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function MissionControlDashboardPage() {
  const [overview, setOverview] = useState<MissionControlOverview | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      const overviewData = await getMissionControlOverview();
      const requestData = await getServiceRequests();

      if (!active) return;

      setOverview(overviewData);
      setServiceRequests(requestData);
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

  async function refreshData() {
    const overviewData = await getMissionControlOverview();
    const requestData = await getServiceRequests();

    setOverview(overviewData);
    setServiceRequests(requestData);
  }

  async function runAction(
    requestId: string,
    action: () => Promise<unknown>
  ) {
    try {
      setActionLoading(requestId);
      await action();
      await refreshData();
    } catch (error) {
      console.error(error);
      alert("Action failed. Please check provider, mechanic, driver availability, or request status.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-8">
      <section>
        <p className="text-green-400 font-semibold uppercase tracking-wider">
          Alpha Mission Control
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Service Operations Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Monitor customer orders, service requests, providers, mechanics,
          drivers, proof completion, and financials.
        </p>
      </section>

      <FinancialOverviewCards data={overview} />

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Live Service Requests</h2>
            <p className="text-gray-400 text-sm mt-1">
              Customer service jobs requiring provider, mechanic, parts, and driver workflow.
            </p>
          </div>

          <div className="rounded-xl bg-[#0B0F14] border border-white/10 px-4 py-2">
            <p className="text-xs text-gray-500">Total Requests</p>
            <p className="font-bold text-green-400">
              {serviceRequests.length}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {serviceRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0B0F14] p-8 text-center">
              <p className="text-gray-400">No service requests yet.</p>
            </div>
          ) : (
            serviceRequests.map((request) => {
              const isBusy = actionLoading === request.id;

              const canAssignProvider =
                request.status === "new_request" ||
                request.status === "provider_needed";

              const canAssignMechanic =
                request.status === "provider_accepted" ||
                request.status === "mechanic_needed" ||
                request.status === "provider_assigned";

              const canAssignDriver =
                request.status === "parts_requested" ||
                request.status === "driver_needed";

              return (
                <div
                  key={request.id}
                  className="rounded-2xl bg-[#0B0F14] border border-white/10 p-5 hover:border-green-500/20 transition-all"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold">
                          {request.customerName}
                        </h3>

                        <span className="rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs text-green-400 capitalize">
                          {formatStatus(request.status)}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Vehicle: {request.vehicleInfo || "N/A"}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Issue: {request.issueDescription}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Zone: {request.zone || "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-full xl:min-w-[520px]">
                      <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                          Provider
                        </p>
                        <p className="text-white font-semibold mt-2">
                          {request.providerName || "Not Assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                          Mechanic
                        </p>
                        <p className="text-white font-semibold mt-2">
                          {request.mechanicName || "Not Assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                          Driver
                        </p>
                        <p className="text-white font-semibold mt-2">
                          {request.driverName || "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                    <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Service Address
                      </p>
                      <p className="text-white font-semibold mt-2 line-clamp-2">
                        {request.serviceAddress}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Parts
                      </p>
                      <p className="text-yellow-400 font-semibold mt-2">
                        {request.status === "parts_requested"
                          ? "Requested"
                          : "Not Requested"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Payment
                      </p>
                      <p className="text-green-400 font-semibold mt-2 capitalize">
                        {request.paymentStatus || "unpaid"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#111827] border border-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Final Amount
                      </p>
                      <p className="text-white font-semibold mt-2">
                        ${request.finalAmount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() =>
                        runAction(request.id, () => assignProvider(request.id))
                      }
                      disabled={isBusy || !canAssignProvider}
                      className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBusy ? "Working..." : "Assign Provider"}
                    </button>

                    <button
                      onClick={() =>
                        runAction(request.id, () => assignMechanic(request.id))
                      }
                      disabled={isBusy || !canAssignMechanic}
                      className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBusy ? "Working..." : "Assign Mechanic"}
                    </button>

                    <button
                      onClick={() =>
                        runAction(request.id, () => assignDriver(request.id))
                      }
                      disabled={isBusy || !canAssignDriver}
                      className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBusy ? "Working..." : "Assign Driver"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <div className="mb-5">
          <h2 className="text-xl font-bold">Parts Orders / Product Deliveries</h2>
          <p className="text-gray-400 text-sm mt-1">
            Existing Alpha supplier and driver order workflow.
          </p>
        </div>

        <ActiveOrdersTable />
      </section>
    </main>
  );
}