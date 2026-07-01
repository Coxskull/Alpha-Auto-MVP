"use client";

import { use, useCallback, useEffect, useState } from "react";
import { getOrder } from "@/services/orders";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  itemDescription: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

const steps = [
  "payment_pending",
  "pending",
  "supplier_assigned",
  "supplier_accepted",
  "ready_for_pickup",
  "driver_assigned",
  "picked_up",
  "en_route",
  "delivered",
  "proof_uploaded",
  "completed",
];

export default function CustomerOrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load order.");
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    const timer = window.setInterval(() => {
      void loadOrder();
    }, 15000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(timer);
    };
  }, [loadOrder]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] text-white p-5">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#020617] text-white p-5">
        Loading order...
      </main>
    );
  }

  const currentIndex = steps.indexOf(order.status);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-5">
      <h1 className="text-2xl font-black">Parts Order Tracking</h1>

      <div className="mt-4 rounded-2xl bg-slate-900 border border-white/10 p-5">
        <p className="text-slate-400">Order Number</p>
        <p className="font-bold">{order.orderNumber}</p>

        <p className="text-slate-400 mt-4">Customer</p>
        <p>{order.customerName}</p>

        <p className="text-slate-400 mt-4">Current Status</p>
        <p className="text-emerald-400 text-xl font-black">
          {order.status.replaceAll("_", " ").toUpperCase()}
        </p>

        <p className="text-slate-400 mt-4">Part</p>
        <p>{order.itemDescription}</p>

        <p className="text-slate-400 mt-4">Delivery Address</p>
        <p>{order.deliveryAddress}</p>
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

      {["delivered", "proof_uploaded", "completed"].includes(order.status) && (
        <div className="mt-6 grid gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/order/${order.id}/html`}
            target="_blank"
            className="block text-center rounded-xl bg-white text-black py-3 font-bold"
          >
            View Invoice
          </a>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/receipts/order/${order.id}/html`}
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