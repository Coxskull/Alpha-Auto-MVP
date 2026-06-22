"use client";

import { useEffect, useState } from "react";

import { getProviderOrders } from "@/services/orders";

import { ProviderOrder } from "@/types/order";

import OrdersTable from "@/components/provider/orders/OrdersTable";
import OrderDetailsDrawer from "@/components/provider/orders/OrderDetailsDrawer";

export default function OrdersPage() {
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<ProviderOrder | null>(null);

  // Initial Load
  useEffect(() => {
    let mounted = true;

    async function fetchOrders() {
      try {
        const data = await getProviderOrders();

        if (mounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    }

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

  // Refresh after Accept / Ready
  const refreshOrders = async () => {
    try {
      const data = await getProviderOrders();

      setOrders(data);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Orders
        </h1>

        <p className="text-gray-400 mt-2">
          Manage incoming provider orders
        </p>
      </div>

      <OrdersTable
        orders={orders}
        onSelect={setSelectedOrder}
      />

      <OrderDetailsDrawer
        order={selectedOrder}
        onClose={() =>
          setSelectedOrder(null)
        }
        onRefresh={refreshOrders}
      />

    </div>
  );
}