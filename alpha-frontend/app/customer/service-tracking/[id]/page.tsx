"use client";

import Image from "next/image";
import { use, useCallback, useEffect, useState } from "react";
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
  "closed",
];

export default function CustomerServiceTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState("");

  const loadRequest = useCallback(async () => {
    try {
      const data = await getServiceRequest(id);
      setRequest(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load service request.");
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRequest();
    }, 0);

    const timer = window.setInterval(() => {
      void loadRequest();
    }, 15000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(timer);
    };
  }, [loadRequest]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] text-white p-5">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="min-h-screen bg-[#020617] text-white p-5">
        Loading service request...
      </main>
    );
  }

  const currentIndex = steps.indexOf(request.status);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-5">
      <h1 className="text-2xl font-black">Mechanic Request Tracking</h1>

      <div className="mt-4 rounded-2xl bg-slate-900 border border-white/10 p-5">
        <p className="text-slate-400">Request ID</p>
        <p className="font-bold break-all">{request.id}</p>

        <p className="text-slate-400 mt-4">Customer</p>
        <p>{request.customerName}</p>

        <p className="text-slate-400 mt-4">Vehicle</p>
        <p>{request.vehicleInfo || "Not provided"}</p>

        <p className="text-slate-400 mt-4">Issue</p>
        <p>{request.issueDescription}</p>

        <p className="text-slate-400 mt-4">Service Address</p>
        <p>{request.serviceAddress}</p>

        <p className="text-slate-400 mt-4">Current Status</p>
        <p className="text-emerald-400 text-xl font-black">
          {request.status.replaceAll("_", " ").toUpperCase()}
        </p>

        <p className="text-slate-400 mt-4">Payment Status</p>
        <p
          className={
            request.paymentStatus === "paid"
              ? "text-emerald-400 font-bold"
              : "text-yellow-400 font-bold"
          }
        >
          {(request.paymentStatus || "unpaid").toUpperCase()}
        </p>

        {request.finalAmount !== undefined && request.finalAmount !== null && (
          <>
            <p className="text-slate-400 mt-4">Final Amount</p>
            <p className="font-bold">
              ${Number(request.finalAmount).toFixed(2)}
            </p>
          </>
        )}

        {request.partsRequestNote && (
          <>
            <p className="text-slate-400 mt-4">Parts Request Note</p>
            <p>{request.partsRequestNote}</p>
          </>
        )}

        {request.proofImageUrl && (
          <div className="mt-5">
            <p className="text-slate-400 mb-2">Proof Image</p>
            <div className="relative h-64 w-full overflow-hidden rounded-xl border border-white/10">
              <Image
                src={request.proofImageUrl}
                alt="Repair proof"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => {
          const done = currentIndex >= index;

          return (
            <div
              key={step}
              className={`rounded-xl border p-4 ${
                done
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-white/10 bg-slate-900"
              }`}
            >
              <p className={done ? "text-emerald-400" : "text-slate-400"}>
                {step.replaceAll("_", " ").toUpperCase()}
              </p>
            </div>
          );
        })}
      </div>

      {["completed", "closed"].includes(request.status) && (
        <div className="mt-6 grid gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/service-request/${request.id}/html`}
            target="_blank"
            className="block text-center rounded-xl bg-white text-black py-3 font-bold"
          >
            View Invoice
          </a>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/receipts/service-request/${request.id}/html`}
            target="_blank"
            className="block text-center rounded-xl bg-emerald-500 text-black py-3 font-bold"
          >
            View Receipt
          </a>
        </div>
      )}
    </main>
  );
}