"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

type Order = {
  id: string;
  orderNumber?: string;
  order_number?: string;
  customerName?: string;
  customer_name?: string;
  status: string;
};

export default function ActiveOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await api.get("/api/Orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return <p className="text-gray-400">No active orders found.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.slice(0, 5).map((order) => (
        <div
          key={order.id}
          className="rounded-xl bg-[#1F2937] p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-semibold">
              {order.orderNumber || order.order_number || "Order"}
            </p>

            <p className="text-gray-400 text-sm">
              {order.customerName || order.customer_name || "Customer"}
            </p>
          </div>

          <span className="text-green-400 text-sm font-semibold">
            {order.status}
          </span>
        </div>
      ))}
    </div>
  );
}