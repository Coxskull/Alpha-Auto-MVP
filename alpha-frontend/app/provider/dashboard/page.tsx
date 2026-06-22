"use client";

import { useEffect, useState } from "react";
import { getProviderOrders } from "@/services/orders";
import { ProviderOrder } from "@/types/order";

export default function Dashboard() {
  const [orders, setOrders] = useState<ProviderOrder[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getProviderOrders();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadOrders();
  }, []);
const newOrders = orders.filter(
  (o) => o.status === "supplier_assigned"
).length;

const readyForPickup = orders.filter(
  (o) => o.status === "ready_for_pickup"
).length;

const activeDeliveries = orders.filter(
  (o) =>
    o.status === "driver_assigned" ||
    o.status === "picked_up" ||
    o.status === "en_route"
).length;
  return (
    <div className="grid grid-cols-4 gap-6">

  <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
    <h3 className="text-gray-300">
      New Orders
    </h3>

    <p className="text-4xl font-bold text-green-400 mt-2">
      {newOrders}
    </p>
  </div>

  <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
    <h3 className="text-gray-300">
      Ready For Pickup
    </h3>

    <p className="text-4xl font-bold text-green-400 mt-2">
      {readyForPickup}
    </p>
  </div>

  <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
    <h3 className="text-gray-300">
      Active Deliveries
    </h3>

    <p className="text-4xl font-bold text-blue-400 mt-2">
      {activeDeliveries}
    </p>
  </div>

  <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700">
    <h3 className="text-gray-300">
      Total Orders
    </h3>

    <p className="text-4xl font-bold text-green-400 mt-2">
      {orders.length}
    </p>
  </div>

</div>
  );
}