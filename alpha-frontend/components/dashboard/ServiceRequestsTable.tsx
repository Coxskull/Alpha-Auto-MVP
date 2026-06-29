"use client";

import { useEffect, useState } from "react";
import {
  assignProvider,
  assignMechanic,
  assignDriver,
  getServiceRequests,
} from "@/services/serviceRequests";
import type { ServiceRequest } from "@/types/serviceRequest";

type Props = {
  onUpdated?: () => Promise<void>;
};

const steps = [
  "new_request",
  "provider_assigned",
  "provider_accepted",
  "mechanic_assigned",
  "mechanic_accepted",
  "parts_requested",
  "driver_assigned",
  "parts_picked_up",
  "parts_delivered",
  "repair_started",
  "proof_uploaded",
  "completed",
];

function isDone(current: string, target: string) {
  const currentIndex = steps.indexOf(current);
  const targetIndex = steps.indexOf(target);

  if (currentIndex === -1 || targetIndex === -1) {
    return false;
  }

  return currentIndex >= targetIndex;
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function shortId(value?: string | null) {
  if (!value) return null;
  return `${value.slice(0, 8)}...`;
}

export default function ServiceRequestsTable({ onUpdated }: Props) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchRequests() {
    const data = await getServiceRequests();

    setRequests(data);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await getServiceRequests();

      if (!active) return;

      setRequests(data);
      setLoading(false);
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

  async function handleAction(
    requestId: string,
    action: () => Promise<unknown>
  ) {
    try {
      setActionLoading(requestId);

      await action();
      await fetchRequests();

      if (onUpdated) {
        await onUpdated();
      }
    } catch (error) {
      console.error(error);
      alert("Action failed. Check availability, zone, or request status.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading service requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">
        <p className="text-gray-400">
          No mechanic service requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {requests.map((request) => {
        const isBusy = actionLoading === request.id;

        const canAssignProvider =
          request.status === "new_request" ||
          request.status === "provider_needed";

        const canAssignMechanic =
          request.status === "provider_assigned" ||
          request.status === "provider_accepted" ||
          request.status === "mechanic_needed";

        const canAssignDriver =
          request.status === "parts_requested" ||
          request.status === "driver_needed";

        const providerValue =
  request.providerName ||
  shortId(request.providerId) ||
  "Not Assigned";

const mechanicValue =
  request.mechanicName ||
  shortId(request.mechanicId) ||
  "Not Assigned";

const driverValue =
  request.driverName ||
  shortId(request.driverId) ||
  "Not Assigned";

        return (
          <div
            key={request.id}
            className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-emerald-500/20 transition-all"
          >
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white">
                    {request.customerName}
                  </h3>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 capitalize">
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
                <AssignmentInfo
                  label="Provider"
                  value={providerValue}
                  assigned={Boolean(request.providerId)}
                />

                <AssignmentInfo
                  label="Mechanic"
                  value={mechanicValue}
                  assigned={Boolean(request.mechanicId)}
                />

                <AssignmentInfo
                  label="Driver"
                  value={driverValue}
                  assigned={Boolean(request.driverId)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
              <Info
                label="Service Address"
                value={request.serviceAddress}
              />

              <Info
                label="Zone"
                value={request.zone || "N/A"}
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

            <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-2">
              {[
                ["Provider", "provider_assigned"],
                ["Mechanic", "mechanic_assigned"],
                ["Parts", "parts_requested"],
                ["Driver", "driver_assigned"],
                ["Proof", "proof_uploaded"],
                ["Done", "completed"],
              ].map(([label, step]) => (
                <div
                  key={step}
                  className={`rounded-xl border p-3 text-center text-xs font-bold ${
                    isDone(request.status, step)
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-white/10 bg-[#111827] text-gray-500"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                disabled={isBusy || !canAssignProvider}
                onClick={() =>
                  handleAction(
                    request.id,
                    () => assignProvider(request.id)
                  )
                }
                className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {isBusy ? "Working..." : "Assign Provider"}
              </button>

              <button
                disabled={isBusy || !canAssignMechanic}
                onClick={() =>
                  handleAction(
                    request.id,
                    () => assignMechanic(request.id)
                  )
                }
                className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {isBusy ? "Working..." : "Assign Mechanic"}
              </button>

              <button
                disabled={isBusy || !canAssignDriver}
                onClick={() =>
                  handleAction(
                    request.id,
                    () => assignDriver(request.id)
                  )
                }
                className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {isBusy ? "Working..." : "Assign Driver"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssignmentInfo({
  label,
  value,
  assigned,
}: {
  label: string;
  value: string | number;
  assigned: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        assigned
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-[#111827] border-white/5"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </p>

      <p
        className={`font-semibold mt-2 ${
          assigned ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        {assigned ? "Assigned" : "Waiting"}
      </p>
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