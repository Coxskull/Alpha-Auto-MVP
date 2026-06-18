"use client";

import { useEffect, useState } from "react";
import { getDriverHistory } from "@/services/orders";
import { Order } from "@/types/order";

const DRIVER_ID = "2246e99b-43c8-42d9-8332-766fc130da34";

export default function DriverHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data =
          await getDriverHistory(DRIVER_ID);

        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] p-6 text-white">
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">
        Delivery History
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <p className="text-gray-400">
            Completed Deliveries
          </p>

          <p className="text-3xl font-bold text-green-400">
            {orders.length}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-gray-400 text-center">
          No completed deliveries yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#111827] border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-white font-bold">
                {order.orderNumber}
              </h3>

              <p className="text-gray-400 mt-1">
                {order.itemDescription}
              </p>

              <p className="text-green-400 mt-2">
                Delivered
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}