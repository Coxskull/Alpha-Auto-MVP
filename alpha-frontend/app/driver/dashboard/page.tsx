"use client";

import { useEffect, useState } from "react";
import {
  getMyDriverRequests,
  updateDriverStatus,
} from "@/services/serviceRequests";
import { getDriverDashboard } from "@/services/dashboard";
import type {
  ServiceRequest,
  DriverDashboardStats,
} from "@/types/serviceRequest";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function DriverDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchData() {
    const requestData = await getMyDriverRequests();
    const statsData = await getDriverDashboard();

    setRequests(requestData);
    setStats(statsData);
    setLoading(false);
  }

  useEffect(() => {
  let active = true;

  async function load() {
    try {
      const requestData = await getMyDriverRequests();
      const statsData = await getDriverDashboard();

      if (!active) return;

      setRequests(requestData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load driver dashboard", error);
      alert("Driver access denied. Please check driver role or driver email.");
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  void load();

  const timer = window.setInterval(() => {
    void load();
  }, 15000);

  return () => {
    active = false;
    window.clearInterval(timer);
  };
}, []);

  async function run(
    requestId: string,
    action: () => Promise<unknown>
  ) {
    try {
      setActionLoading(requestId);
      await action();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Driver action failed. Please check the request status.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0F14] p-6 text-white">
        Loading driver dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-6">
      <section>
        <p className="text-orange-400 font-semibold uppercase tracking-wider">
          Alpha Driver Panel
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Parts Delivery Requests
        </h1>

        <p className="text-gray-400 mt-2">
          View service requests assigned to you and update parts pickup or delivery.
        </p>
      </section>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card label="Assigned" value={stats.jobs.assigned} />
          <Card label="Picked Up" value={stats.jobs.pickedUp} />
          <Card label="Delivered" value={stats.jobs.delivered} />
          <Card label="Completed" value={stats.jobs.completed} />
          <Card label="Earnings" value={`$${stats.financials.earnings}`} />
        </div>
      )}

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <h2 className="text-xl font-bold">
          Assigned Service Deliveries
        </h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          These are mechanic service jobs where parts delivery is assigned to you.
        </p>

        {requests.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">
            <p className="text-gray-400">
              No assigned service deliveries yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const isBusy = actionLoading === request.id;

              const canPickUp =
                request.status === "driver_assigned";

              const canDeliver =
                request.status === "parts_picked_up";

              return (
                <div
                  key={request.id}
                  className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-orange-500/20 transition-all"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {request.customerName}
                        </h3>

                        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 capitalize">
                          {formatStatus(request.status)}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Vehicle: {request.vehicleInfo || "N/A"}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Issue: {request.issueDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Info
                        label="Provider"
                        value={
                          request.providerName ||
                          request.providerId ||
                          "Not Assigned"
                        }
                      />

                      <Info
                        label="Mechanic"
                        value={
                          request.mechanicName ||
                          request.mechanicId ||
                          "Not Assigned"
                        }
                      />

                      <Info
                        label="Parts Status"
                        value={
                          request.partsRequestNote ||
                          "Parts requested"
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                    <Info
                      label="Pickup Zone"
                      value={request.zone || "N/A"}
                    />

                    <Info
                      label="Delivery Address"
                      value={request.serviceAddress}
                    />

                    <Info
                      label="Payment"
                      value={request.paymentStatus || "unpaid"}
                    />

                    <Info
                      label="Amount"
                      value={`$${request.finalAmount || 0}`}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Step
                      label="Assigned"
                      active={request.status === "driver_assigned"}
                      done={
                        request.status === "parts_picked_up" ||
                        request.status === "parts_delivered" ||
                        request.status === "repair_started" ||
                        request.status === "proof_uploaded" ||
                        request.status === "completed"
                      }
                    />

                    <Step
                      label="Parts Picked Up"
                      active={request.status === "parts_picked_up"}
                      done={
                        request.status === "parts_delivered" ||
                        request.status === "repair_started" ||
                        request.status === "proof_uploaded" ||
                        request.status === "completed"
                      }
                    />

                    <Step
                      label="Parts Delivered"
                      active={request.status === "parts_delivered"}
                      done={
                        request.status === "repair_started" ||
                        request.status === "proof_uploaded" ||
                        request.status === "completed"
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      disabled={isBusy || !canPickUp}
                      onClick={() =>
                        run(
                          request.id,
                          () =>
                            updateDriverStatus(
                              request.id,
                              "parts_picked_up"
                            )
                        )
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Parts Picked Up"}
                    </button>

                    <button
                      disabled={isBusy || !canDeliver}
                      onClick={() =>
                        run(
                          request.id,
                          () =>
                            updateDriverStatus(
                              request.id,
                              "parts_delivered"
                            )
                        )
                      }
                      className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Parts Delivered"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
      <p className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </p>

      <p className="text-white font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}

function Step({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center text-xs font-bold ${
        done
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : active
          ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
          : "border-white/10 bg-[#111827] text-gray-500"
      }`}
    >
      {label}
    </div>
  );
}