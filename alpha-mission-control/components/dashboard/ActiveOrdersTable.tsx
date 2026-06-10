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
} from "@/services/orderActions";
export default function ActiveOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
const [actionLoading, setActionLoading] =
  useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] =
  useState<Order | null>(null);
  const fetchOrders = async () => {
    try {
      const response = await api.get("/Orders");

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

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading orders...
      </div>
    );
  }
const handleAction = async (
  action: () => Promise<unknown>,
  orderId: number
) => {
  try {
    setActionLoading(orderId);

    await action();

    await fetchOrders();
  } catch (error) {
    console.error(error);
  } finally {
    setActionLoading(null);
  }
};
  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-green-500/20 transition-all"
        >
          {/* Header */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">
                  {order.orderNumber}
                </h3>

                <StatusChip
                  status={order.status}
                />
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

                <p className="text-sm font-semibold text-white mt-1">
                  {order.status}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mt-6">
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
                Pickup
              </p>

              <p className="text-white font-semibold mt-2">
                {order.pickupAddress}
              </p>
            </div>

            <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Delivery
              </p>

              <p className="text-white font-semibold mt-2">
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8">
            <OrderTimeline
              steps={[
                {
                  label: "Pending",
                  completed: true,
                },
                {
                  label: "Supplier",
                  completed:
  order.status ===
    "Supplier Assigned" ||
  order.status ===
    "Driver Assigned" ||
  order.status ===
    "Picked Up" ||
  order.status ===
    "En Route" ||
  order.status ===
    "Delivered",
                },
                {
                  label: "Driver",
                  completed:
                    order.status ===
                      "Driver Assigned" ||
                    order.status ===
                      "Picked Up" ||
                    order.status ===
                      "En Route" ||
                    order.status ===
                      "Delivered",
                },
                {
                  label: "Pickup",
                  completed:
                    order.status ===
                      "Picked Up" ||
                    order.status ===
                      "En Route" ||
                    order.status ===
                      "Delivered",
                },
                {
                  label: "En Route",
                  completed:
                    order.status ===
                      "En Route" ||
                    order.status ===
                      "Delivered",
                },
                {
                  label: "Delivered",
                  completed:
                    order.status ===
                    "Delivered",
                },
              ]}
            />
          </div>
          {/* Actions */}
<div className="flex flex-wrap gap-3 mt-8">
  {/* View */}
  <button
  onClick={() =>
    setSelectedOrder(order)
  }
  className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl"
>
  View Details
</button>

  {/* Assign Driver */}
  <button
    onClick={() =>
      handleAction(
        () => assignDriver(order.id),
        order.id
      )
    }
    disabled={actionLoading === order.id}
    className="bg-[#111827] hover:bg-[#1F2937] border border-white/5 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
  >
    {actionLoading === order.id
      ? "Assigning..."
      : "Assign Driver"}
  </button>

  {/* Assign Supplier */}
  <button
    onClick={() =>
      handleAction(
        () =>
          assignSupplier(order.id),
        order.id
      )
    }
    disabled={actionLoading === order.id}
    className="bg-[#111827] hover:bg-[#1F2937] border border-white/5 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
  >
    {actionLoading === order.id
      ? "Assigning..."
      : "Assign Supplier"}
  </button>

  {/* Picked Up */}
  <button
    onClick={() =>
      handleAction(
        () => markPickedUp(order.id),
        order.id
      )
    }
    disabled={actionLoading === order.id}
    className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
  >
    Picked Up
  </button>

  {/* En Route */}
  <button
    onClick={() =>
      handleAction(
        () => markEnRoute(order.id),
        order.id
      )
    }
    disabled={actionLoading === order.id}
    className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
  >
    En Route
  </button>

  {/* Delivered */}
  <button
    onClick={() =>
      handleAction(
        () => markDelivered(order.id),
        order.id
      )
    }
    disabled={actionLoading === order.id}
    className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
  >
    Delivered
  </button>
</div>
        </div>
      ))}
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