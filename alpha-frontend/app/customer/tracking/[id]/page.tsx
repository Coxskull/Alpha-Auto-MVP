"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder } from "@/services/orders";
import { Order } from "@/types/order";

export default function TrackingPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const data = await getOrder(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Order could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading order...
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <p className="text-slate-400 mt-2">{error}</p>
        </div>
      </main>
    );
  }

  const steps = [
    "payment_pending",
    "pending",
    "supplier_assigned",
    "supplier_accepted",
    "ready_for_pickup",
    "driver_assigned",
    "driver_accepted",
    "picked_up",
    "en_route",
    "arrived",
    "delivered",
    "proof_uploaded",
    "completed",
  ];

  const currentStep = Math.max(steps.indexOf(order.status), 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-10">
      <div className="bg-gradient-to-r from-green-900 to-green-700 p-6">
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <p className="text-green-100">{order.orderNumber}</p>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-slate-900 rounded-2xl p-6">
          <h2 className="text-2xl font-bold">Your Order Is Active</h2>
          <p className="text-slate-400 mt-2">Status: {order.status}</p>

          <div className="h-2 bg-slate-700 rounded-full mt-6">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6">
          <h3 className="font-bold text-xl mb-4">Delivery Information</h3>

          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Pickup:</strong> {order.pickupAddress}</p>
          <p><strong>Delivery:</strong> {order.deliveryAddress}</p>
          <p><strong>Item:</strong> {order.itemDescription}</p>
          <p><strong>Zone:</strong> {order.zone}</p>
        </div>
      </div>
    </main>
  );
}