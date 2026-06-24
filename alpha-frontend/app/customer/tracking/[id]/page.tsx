"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder } from "@/services/orders";
import { Order } from "@/types/order";

const steps = [
  { key: "payment_pending", label: "Payment" },
  { key: "pending", label: "Order" },
  { key: "supplier_assigned", label: "Supplier" },
  { key: "supplier_accepted", label: "Accepted" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "driver_assigned", label: "Driver" },
  { key: "driver_accepted", label: "Driver Accepted" },
  { key: "picked_up", label: "Picked Up" },
  { key: "en_route", label: "En Route" },
  { key: "arrived", label: "Arrived" },
  { key: "delivered", label: "Delivered" },
  { key: "proof_uploaded", label: "Proof" },
  { key: "completed", label: "Completed" },
];

export default function TrackingPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadOrder() {
      try {
        const data = await getOrder(id);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Loading order...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-black">Order Not Found</h1>
          <p className="text-slate-400 mt-2">
            Order could not be loaded.
          </p>
        </div>
      </main>
    );
  }

  const currentStep = Math.max(
    steps.findIndex((step) => step.key === order.status),
    0
  );

  const progress =
    ((currentStep + 1) / steps.length) * 100;

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-10">
      <section className="bg-gradient-to-br from-emerald-700 via-green-800 to-slate-950 p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-200 text-sm">
            Tracking Number
          </p>

          <h1 className="text-3xl font-black mt-1">
            {order.orderNumber}
          </h1>

          <div className="mt-5 inline-flex bg-emerald-400 text-black font-bold px-4 py-2 rounded-full text-sm">
            {order.status.replaceAll("_", " ")}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto p-4 space-y-5">
        <section className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
          <h2 className="text-xl font-black">
            Delivery Progress
          </h2>

          <div className="h-3 bg-slate-800 rounded-full mt-5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 space-y-4">
            {steps.map((step, index) => {
              const isDone = index <= currentStep;

              return (
                <div
                  key={step.key}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      isDone
                        ? "bg-emerald-500 text-black"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </div>

                  <div>
                    <p
                      className={`font-bold ${
                        isDone
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="text-xs text-slate-500">
                      {step.key.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
          <h2 className="text-xl font-black mb-4">
            Delivery Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm">Customer</p>
              <p className="font-bold">{order.customerName}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">Pickup Address</p>
              <p>{order.pickupAddress}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm">Delivery Address</p>
              <p>{order.deliveryAddress}</p>
            </div>
          </div>
        </section>

        <section className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
          <h2 className="text-xl font-black mb-4">
            Order Details
          </h2>

          <div className="space-y-3">
            <p>
              <span className="text-slate-400">Item:</span>{" "}
              {order.itemDescription}
            </p>

            <p>
              <span className="text-slate-400">Zone:</span>{" "}
              {order.zone}
            </p>

            <p>
              <span className="text-slate-400">Status:</span>{" "}
              {order.status}
            </p>
          </div>
        </section>

        <section className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
          <h2 className="text-xl font-black mb-4">
            Delivery Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-2xl p-4">
              <p className="text-slate-400 text-sm">Supplier</p>
              <p className="font-bold">
                {order.supplierName || "Waiting assignment"}
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4">
              <p className="text-slate-400 text-sm">Driver</p>
              <p className="font-bold">
                {order.driverName || "Waiting assignment"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}