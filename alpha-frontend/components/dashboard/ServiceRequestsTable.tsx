"use client";

import { useEffect, useState } from "react";
import {
  assignProvider,
  assignMechanic,
  assignDriver,
  getServiceRequests,
} from "@/services/serviceRequests";
import type { ServiceRequest } from "@/types/serviceRequest";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function ServiceRequestsTable() {
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
    } catch (error) {
      console.error(error);
      alert("Action failed. Please check request status or availability.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading service requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">
        <p className="text-gray-400">No mechanic requests yet.</p>
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

        return (
          <div
            key={request.id}
            className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6"
          >
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {request.customerName}
                </h3>

                <p className="text-gray-400 text-sm mt-2">
                  Vehicle: {request.vehicleInfo || "N/A"}
                </p>

                <p className="text-gray-400 text-sm">
                  Issue: {request.issueDescription}
                </p>

                <p className="text-green-400 mt-2 capitalize">
                  {formatStatus(request.status)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Info label="Provider" value={request.providerName || "Not Assigned"} />
                <Info label="Mechanic" value={request.mechanicName || "Not Assigned"} />
                <Info label="Driver" value={request.driverName || "Not Assigned"} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
              <Info label="Address" value={request.serviceAddress} />
              <Info label="Zone" value={request.zone || "N/A"} />
              <Info label="Payment" value={request.paymentStatus || "unpaid"} />
              <Info label="Amount" value={`$${request.finalAmount || 0}`} />
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                disabled={isBusy || !canAssignProvider}
                onClick={() =>
                  handleAction(request.id, () => assignProvider(request.id))
                }
                className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Assign Provider
              </button>

              <button
                disabled={isBusy || !canAssignMechanic}
                onClick={() =>
                  handleAction(request.id, () => assignMechanic(request.id))
                }
                className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Assign Mechanic
              </button>

              <button
                disabled={isBusy || !canAssignDriver}
                onClick={() =>
                  handleAction(request.id, () => assignDriver(request.id))
                }
                className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Assign Driver
              </button>
            </div>
          </div>
        );
      })}
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
      <p className="text-white font-semibold mt-2">{value}</p>
    </div>
  );
}