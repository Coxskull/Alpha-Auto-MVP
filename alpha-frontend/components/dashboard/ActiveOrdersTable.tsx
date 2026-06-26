"use client";

import { useEffect, useState } from "react";
import OrderDetailsModal from "../orders/OrderDetailsModal";
import api from "@/services/api";

import { Order } from "@/types/dashboard";

import StatusChip from "../StatusChip";
import OrderTimeline from "../orders/OrderTimeline";

import {
  assignDriver,
  assignSupplier,
  markPickedUp,
  markEnRoute,
  markDelivered,
  confirmPayment,
} from "@/services/orderActions";

type TimelineStep = {
  label: string;
  completed: boolean;
};

const orderStatusSteps = [
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

function isStepCompleted(
  currentStatus: string,
  targetStatus: string
) {
  const currentIndex =
    orderStatusSteps.indexOf(currentStatus);

  const targetIndex =
    orderStatusSteps.indexOf(targetStatus);

  if (currentIndex === -1 || targetIndex === -1) {
    return false;
  }

  return currentIndex >= targetIndex;
}

function buildTimeline(order: Order): TimelineStep[] {
  return [
    {
      label: "Payment",
      completed: isStepCompleted(
        order.status,
        "payment_pending"
      ),
    },
    {
      label: "Order",
      completed: isStepCompleted(
        order.status,
        "pending"
      ),
    },
    {
      label: "Supplier",
      completed: isStepCompleted(
        order.status,
        "supplier_assigned"
      ),
    },
    {
      label: "Ready",
      completed: isStepCompleted(
        order.status,
        "ready_for_pickup"
      ),
    },
    {
      label: "Driver",
      completed: isStepCompleted(
        order.status,
        "driver_assigned"
      ),
    },
    {
      label: "Pickup",
      completed: isStepCompleted(
        order.status,
        "picked_up"
      ),
    },
    {
      label: "En Route",
      completed: isStepCompleted(
        order.status,
        "en_route"
      ),
    },
    {
      label: "Delivered",
      completed: isStepCompleted(
        order.status,
        "delivered"
      ),
    },
  ];
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function ActiveOrdersTable() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/Orders");

      setOrders(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch orders",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders();
    };

    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = async (
    action: () => Promise<unknown>,
    orderId: string
  ) => {
    try {
      setActionLoading(orderId);

      await action();

      await fetchOrders();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Action failed. Please check the order status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">
        <p className="text-gray-400">
          No active orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const isBusy =
          actionLoading === order.id;

        const canAssignSupplier = order.status === "pending";

        const canAssignDriver =
  order.status === "supplier_assigned" ||
  order.status === "ready_for_pickup";

        const canPickup =
          order.status === "driver_assigned" ||
          order.status === "driver_accepted";

        const canEnRoute =
          order.status === "picked_up";

        const canDeliver =
          order.status === "en_route" ||
          order.status === "arrived";

          const canConfirmPayment =
  order.status === "payment_pending";

        return (
          <div
            key={order.id}
            className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-emerald-500/20 transition-all"
          >
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white">
                    {order.orderNumber}
                  </h3>

                  <StatusChip
                    status={order.status}
                  />

                  {order.status ===
                    "payment_pending" && (
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      Awaiting Payment
                    </span>
                  )}
                </div>

                <p className="text-gray-400 text-sm mt-2">
                  Customer:{" "}
                  {order.customerName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-[#111827] px-4 py-2 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p className="text-sm font-semibold text-white mt-1 capitalize">
                    {formatStatus(order.status)}
                  </p>
                </div>

                <div className="bg-[#111827] px-4 py-2 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500">
                    Zone
                  </p>

                  <p className="text-sm font-semibold text-white mt-1">
                    {order.zone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mt-6">
              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Supplier
                </p>

                <p className="text-white font-semibold mt-2">
                  {order.supplierName ||
                    "Not Assigned"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Driver
                </p>

                <p className="text-white font-semibold mt-2">
                  {order.driverName ||
                    "Not Assigned"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Mechanic
                </p>

                <p className="text-white font-semibold mt-2">
                  {"Service jobs use Mechanic Queue"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Pickup
                </p>

                <p className="text-white font-semibold mt-2 line-clamp-2">
                  {order.pickupAddress}
                </p>
              </div>

              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Delivery
                </p>

                <p className="text-white font-semibold mt-2 line-clamp-2">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>

            {/* Financial / workflow info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Workflow
                </p>

                <p className="text-emerald-400 font-semibold mt-2">
                  Parts Delivery
                </p>
              </div>

              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Payment
                </p>

                <p className="text-yellow-400 font-semibold mt-2">
                  {order.status ===
                  "payment_pending"
                    ? "Pending"
                    : "In Process"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Dispatch Type
                </p>

                <p className="text-white font-semibold mt-2">
                  Supplier + Driver
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8">
              <OrderTimeline
                steps={buildTimeline(order)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() =>
                  setSelectedOrder(order)
                }
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-xl"
              >
                View Details
              </button>
<button
  onClick={() =>
    handleAction(
      () => confirmPayment(order.id),
      order.id
    )
  }
  disabled={isBusy || !canConfirmPayment}
  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-40"
>
  {isBusy ? "Working..." : "Confirm Payment"}
</button>
              <button
  disabled={isBusy || !canAssignSupplier}
  onClick={() =>
    handleAction(
      () => assignSupplier(order.id),
      order.id
    )
  }
  className={`rounded-xl px-4 py-3 font-bold ${
    canAssignSupplier && !isBusy
      ? "bg-white text-black"
      : "bg-slate-800 text-slate-500 cursor-not-allowed"
  }`}
>
  {isBusy ? "Working..." : "Assign Supplier"}
</button>

              <button
                onClick={() =>
                  handleAction(
                    () =>
                      assignDriver(
                        order.id
                      ),
                    order.id
                  )
                }
                disabled={
                  isBusy ||
                  !canAssignDriver
                }
                className="bg-[#111827] hover:bg-[#1F2937] border border-white/5 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-40"
              >
                {isBusy
                  ? "Working..."
                  : "Assign Driver"}
              </button>

              <button
                onClick={() =>
                  handleAction(
                    () =>
                      markPickedUp(
                        order.id
                      ),
                    order.id
                  )
                }
                disabled={
                  isBusy ||
                  !canPickup
                }
                className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 px-5 py-2.5 rounded-xl transition-all disabled:opacity-40"
              >
                Picked Up
              </button>

              <button
                onClick={() =>
                  handleAction(
                    () =>
                      markEnRoute(
                        order.id
                      ),
                    order.id
                  )
                }
                disabled={
                  isBusy ||
                  !canEnRoute
                }
                className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 px-5 py-2.5 rounded-xl transition-all disabled:opacity-40"
              >
                En Route
              </button>

              <button
                onClick={() =>
                  handleAction(
                    () =>
                      markDelivered(
                        order.id
                      ),
                    order.id
                  )
                }
                disabled={
                  isBusy ||
                  !canDeliver
                }
                className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-5 py-2.5 rounded-xl transition-all disabled:opacity-40"
              >
                Delivered
              </button>
            </div>
          </div>
        );
      })}

      <OrderDetailsModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() =>
          setSelectedOrder(null)
        }
      />
    </div>
  );
}