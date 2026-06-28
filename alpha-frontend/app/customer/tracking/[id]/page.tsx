"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { getServiceRequest } from "@/services/serviceRequests";
import type { ServiceRequest } from "@/types/serviceRequest";

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

export default function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [request, setRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchRequest() {
      const data = await getServiceRequest(id);
      if (active) setRequest(data);
    }

    void fetchRequest();

    const timer = window.setInterval(() => {
      void fetchRequest();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [id]);

  if (!request) {
    return <main className="p-6 text-white">Loading...</main>;
  }

  const currentIndex = steps.indexOf(request.status);

  return (
    <main className="min-h-screen bg-[#0B0F14] p-5 text-white">
      <h1 className="text-2xl font-bold">Service Tracking</h1>

      <div className="mt-4 rounded-2xl bg-[#111827] border border-white/10 p-5">
        <p className="text-gray-400">Current Status</p>
        <p className="text-green-400 text-xl font-bold mt-1">
          {request.status.replaceAll("_", " ").toUpperCase()}
        </p>

        <p className="text-gray-400 mt-4">Vehicle</p>
        <p>{request.vehicleInfo}</p>

        <p className="text-gray-400 mt-4">Issue</p>
        <p>{request.issueDescription}</p>

        <p className="text-gray-400 mt-4">Final Amount</p>
        <p>${request.finalAmount}</p>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => {
          const done = index <= currentIndex;

          return (
            <div
              key={step}
              className={`rounded-xl border p-4 ${
                done
                  ? "border-green-500 bg-green-500/10"
                  : "border-white/10 bg-[#111827]"
              }`}
            >
              <p className={done ? "text-green-400" : "text-gray-400"}>
                {step.replaceAll("_", " ").toUpperCase()}
              </p>
            </div>
          );
        })}
      </div>

      {request.proofImageUrl && (
        <div className="mt-6 rounded-2xl bg-[#111827] border border-white/10 p-5">
          <h2 className="font-bold mb-3">Completion Proof</h2>

          <div className="relative h-72 w-full overflow-hidden rounded-xl">
            <Image
              src={request.proofImageUrl}
              alt="Completion proof"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      )}
    </main>
  );
}