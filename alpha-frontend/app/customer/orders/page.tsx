"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNavigation from "@/components/BottomNavigation";
import { getOrders } from "@/services/orders";
import { Order } from "@/types/order";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const data = await getOrders();
      setOrders(data);
    }

    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-24 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-slate-400">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="block bg-[#0f172a] border border-white/10 rounded-3xl p-5"
              >
                <p className="text-sm text-slate-400">
                  {order.orderNumber}
                </p>

                <h2 className="font-bold mt-1">
                  {order.itemDescription}
                </h2>

                <p className="text-emerald-400 mt-3">
                  {order.status}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}