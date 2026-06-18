"use client";

import { useEffect, useState } from "react";
import { getDriverOrders } from "@/services/orders";
import { Order } from "@/types/order";
import OnlineToggle from "@/components/dashboard/OnlineToggle";
import ActiveDeliveryCard from "@/components/orders/ActiveDeliveryCard";

const DRIVER_ID = "2246e99b-43c8-42d9-8332-766fc130da34";

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  async function loadOrders() {
    try {
      const data = await getDriverOrders(DRIVER_ID);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load driver orders:", error);
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  void loadOrders();
}, []);

  const activeOrder =
    orders.find(
      (order) =>
        order.status === "driver_assigned" ||
        order.status === "picked_up" ||
        order.status === "en_route"
    ) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] p-6 text-white">
        Loading driver dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Driver Dashboard
          </h1>

          <p className="text-gray-400">
            Manage your active delivery
          </p>
        </div>

        <OnlineToggle
          online={online}
          onToggle={() => setOnline(!online)}
        />
      </div>

      {activeOrder ? (
        <ActiveDeliveryCard
          order={activeOrder}
          onRefresh={loadOrders}
        />
      ) : (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-10 text-center">
          <h2 className="text-white text-xl font-bold">
            No active delivery
          </h2>

          <p className="text-gray-400 mt-2">
            You have no assigned delivery right now.
          </p>
        </div>
      )}
    </div>
  );
}