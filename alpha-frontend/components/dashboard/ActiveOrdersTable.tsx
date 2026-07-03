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
  markDelivered,
  confirmPayment,
} from "@/services/orderActions";

type TimelineStep = {
  label: string;
  completed: boolean;
};

const orderStatusSteps = [
  "payment_pending",
  "payment_paid",
  "waiting_for_supplier",
  "supplier_assigned",
  "supplier_accepted",
  "waiting_for_driver",
  "driver_assigned",
  "driver_accepted",
  "waiting_for_pickup",
  "picked_up",
  "en_route",
  "arrived_at_destination",
  "delivered",
  "proof_uploaded",
  "settlement_pending",
  "ready_for_payout",
];

function isStepCompleted(currentStatus: string, targetStatus: string) {
  const currentIndex = orderStatusSteps.indexOf(currentStatus);
  const targetIndex = orderStatusSteps.indexOf(targetStatus);

  if (currentIndex === -1 || targetIndex === -1) return false;

  return currentIndex >= targetIndex;
}

function buildTimeline(order: Order): TimelineStep[] {
  return [
    {
      label: "Payment",
      completed: isStepCompleted(order.status, "payment_paid"),
    },
    {
      label: "Supplier",
      completed: isStepCompleted(order.status, "supplier_assigned"),
    },
    {
      label: "Supplier Accepted",
      completed: isStepCompleted(order.status, "supplier_accepted"),
    },
    {
      label: "Driver",
      completed: isStepCompleted(order.status, "driver_assigned"),
    },
    {
      label: "Driver Accepted",
      completed: isStepCompleted(order.status, "driver_accepted"),
    },
    {
      label: "Pickup",
      completed: isStepCompleted(order.status, "picked_up"),
    },
    {
      label: "En Route",
      completed: isStepCompleted(order.status, "en_route"),
    },
    {
      label: "Delivered",
      completed: isStepCompleted(order.status, "delivered"),
    },
    {
      label: "Payout",
      completed: isStepCompleted(order.status, "ready_for_payout"),
    },
  ];
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getActionError(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: string | { message?: string };
      };
      message?: string;
    };

    if (typeof axiosError.response?.data === "string") {
      return axiosError.response.data;
    }

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    return axiosError.message ?? "Action failed.";
  }

  if (error instanceof Error) return error.message;

  return "Action failed. Please check the order status.";
}

export default function ActiveOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/Orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const timer = setTimeout(() => {
    void fetchOrders();
  }, 0);

  const interval = setInterval(() => {
    void fetchOrders();
  }, 15000);

  return () => {
    clearTimeout(timer);
    clearInterval(interval);
  };
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
      alert(getActionError(error));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">
        <p className="text-gray-400">No active orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const isBusy = actionLoading === order.id;

        const canConfirmPayment = order.status === "payment_pending";

        const canAssignSupplier =
          order.status === "waiting_for_supplier" ||
          order.status === "payment_paid";

        const canAssignDriver =
          order.status === "waiting_for_driver" ||
          order.status === "supplier_accepted";

        const canPickup =
          order.status === "waiting_for_pickup" ||
          order.status === "driver_accepted";

        const canDeliver = order.status === "en_route";

        return (
          <div
            key={order.id}
            className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 transition-all hover:border-emerald-500/20"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white">
                    {order.orderNumber}
                  </h3>

                  <StatusChip status={order.status} />

                  {order.status === "payment_pending" && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                      Awaiting Payment
                    </span>
                  )}

                  {order.status === "waiting_for_supplier" && (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      Ready for Supplier
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  Customer: {order.customerName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-white/5 bg-[#111827] px-4 py-2">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-white">
                    {formatStatus(order.status)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#111827] px-4 py-2">
                  <p className="text-xs text-gray-500">Zone</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {order.zone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-4">
              <InfoCard title="Supplier" value={order.supplierName || "Not Assigned"} />
              <InfoCard title="Driver" value={order.driverName || "Not Assigned"} />
              <InfoCard title="Pickup" value={order.pickupAddress} />
              <InfoCard title="Delivery" value={order.deliveryAddress} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard title="Workflow" value="Parts Delivery" valueClass="text-emerald-400" />
              <InfoCard
                title="Payment"
                value={
                  order.status === "payment_pending"
                    ? "Pending"
                    : "Paid / In Process"
                }
                valueClass={
                  order.status === "payment_pending"
                    ? "text-yellow-400"
                    : "text-emerald-400"
                }
              />
              <InfoCard title="Dispatch Type" value="Supplier + Driver" />
            </div>

            <div className="mt-8">
              <OrderTimeline steps={buildTimeline(order)} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedOrder(order)}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-black hover:bg-emerald-400"
              >
                View Details
              </button>

              <button
                onClick={() =>
                  handleAction(() => confirmPayment(order.id), order.id)
                }
                disabled={isBusy || !canConfirmPayment}
                className="rounded-xl bg-yellow-500 px-5 py-2.5 font-semibold text-black transition-all hover:bg-yellow-400 disabled:opacity-40"
              >
                {isBusy ? "Working..." : "Confirm Payment"}
              </button>

              <button
                disabled={isBusy || !canAssignSupplier}
                onClick={() =>
                  handleAction(() => assignSupplier(order.id), order.id)
                }
                className="rounded-xl bg-white px-5 py-2.5 font-semibold text-black transition-all disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isBusy ? "Working..." : "Assign Supplier"}
              </button>

              <button
                onClick={() =>
                  handleAction(() => assignDriver(order.id), order.id)
                }
                disabled={isBusy || !canAssignDriver}
                className="rounded-xl border border-white/5 bg-[#111827] px-5 py-2.5 text-white transition-all hover:bg-[#1F2937] disabled:opacity-40"
              >
                {isBusy ? "Working..." : "Assign Driver"}
              </button>

              <button
                onClick={() =>
                  handleAction(() => markPickedUp(order.id), order.id)
                }
                disabled={isBusy || !canPickup}
                className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-2.5 text-cyan-400 transition-all hover:bg-cyan-500/20 disabled:opacity-40"
              >
                Picked Up
              </button>

              <button
                onClick={() =>
                  handleAction(() => markDelivered(order.id), order.id)
                }
                disabled={isBusy || !canDeliver}
                className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-2.5 text-green-400 transition-all hover:bg-green-500/20 disabled:opacity-40"
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
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

function InfoCard({
  title,
  value,
  valueClass = "text-white",
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500">{title}</p>
      <p className={`mt-2 line-clamp-2 font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}