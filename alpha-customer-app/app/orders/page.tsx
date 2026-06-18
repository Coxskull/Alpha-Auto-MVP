"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getOrders } from "@/services/orders";
import { Order } from "@/types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const data = await getOrders();
      setOrders(data);
    }

    loadOrders();
  }, []);

  return (
    <main className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">
        My Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/tracking/${order.id}`}
            className="block bg-white border rounded-xl p-4"
          >
            <div className="flex justify-between">
              <span className="font-semibold">
                {order.orderNumber}
              </span>

              <span className="text-green-600">
                {order.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {order.itemDescription}
            </p>

            <p className="text-sm mt-1">
              Driver: {order.driverName ?? "Pending"}
            </p>

            <p className="text-sm">
              Supplier: {order.supplierName ?? "Pending"}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}