"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import type { Order } from "@/types/dashboard";
import {
  driverAcceptOrder,
  markDelivered,
  markPickedUp,
} from "@/services/orderActions";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function DriverOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchOrders() {
    const driverId =
      typeof window !== "undefined" ? localStorage.getItem("driverId") : null;

    const response = await api.get<Order[]>("/api/Orders");

    const myOrders = response.data.filter(
      (order) =>
        order.driverId === driverId &&
        [
          "driver_assigned",
          "driver_accepted",
          "waiting_for_pickup",
          "picked_up",
          "en_route",
        ].includes(order.status)
    );

    setOrders(myOrders);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 0);

    const interval = window.setInterval(() => {
      void fetchOrders();
    }, 15000);

    return () => {
      clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  async function run(orderId: string, action: () => Promise<unknown>) {
    try {
      setActionLoading(orderId);
      await action();
      await fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Driver order action failed. Please check the current status.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0F14] p-6 text-white">
        Loading driver orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white">
      <section className="mb-6">
        <p className="font-semibold uppercase tracking-wider text-orange-400">
          Alpha Driver Panel
        </p>

        <h1 className="mt-2 text-3xl font-bold">Order Deliveries</h1>

        <p className="mt-2 text-gray-400">
          Accept assigned customer orders, mark pickup, and complete delivery.
        </p>
      </section>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-8 text-center">
          <p className="text-gray-400">No assigned order deliveries yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const isBusy = actionLoading === order.id;

            const canAccept = order.status === "driver_assigned";
            const canPickup =
              order.status === "driver_accepted" ||
              order.status === "waiting_for_pickup";
            const canDeliver = order.status === "en_route";

            return (
              <article
                key={order.id}
                className="rounded-3xl border border-white/5 bg-[#111827] p-6"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">
                        {order.orderNumber}
                      </h2>

                      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold capitalize text-orange-400">
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-400">
                      Customer: {order.customerName}
                    </p>

                    <p className="text-sm text-gray-400">
                      Items: {order.itemDescription || "N/A"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={isBusy || !canAccept}
                      onClick={() =>
                        run(order.id, () => driverAcceptOrder(order.id))
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Accept Order"}
                    </button>

                    <button
                      disabled={isBusy || !canPickup}
                      onClick={() =>
                        run(order.id, () => markPickedUp(order.id))
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Picked Up"}
                    </button>

                    <button
                      disabled={isBusy || !canDeliver}
                      onClick={() =>
                        run(order.id, () => markDelivered(order.id))
                      }
                      className="rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Delivered"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Info label="Pickup" value={order.pickupAddress} />
                  <Info label="Delivery" value={order.deliveryAddress} />
                  <Info label="Zone" value={order.zone || "N/A"} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B0F14] p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}