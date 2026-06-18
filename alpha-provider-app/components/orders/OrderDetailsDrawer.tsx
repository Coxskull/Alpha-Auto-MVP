"use client";

import { ProviderOrder } from "@/types/order";
import {
  acceptOrder,
  markReadyForPickup,
} from "@/services/orders";

interface Props {
  order: ProviderOrder | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function OrderDetailsDrawer({
  order,
  onClose,
  onRefresh,
}: Props) {
  if (!order) return null;

  async function handleAccept() {
  if (!order) return;

  await acceptOrder(order.id);

  onRefresh();
}

async function handleReady() {
  if (!order) return;

  await markReadyForPickup(order.id);

  onRefresh();
}

  return (
    <div className="fixed right-0 top-0 h-screen w-[450px] bg-[#111827] border-l border-gray-800 p-6 z-50">

      <div className="flex justify-between">

        <h2 className="text-2xl text-white font-bold">
          Order Details
        </h2>

        <button
          onClick={onClose}
          className="text-gray-400"
        >
          X
        </button>

      </div>

      <div className="mt-6 space-y-4">

        <p className="text-white">
          <strong>Order:</strong>{" "}
          {order.orderNumber}
        </p>

        <p className="text-white">
          <strong>Customer:</strong>{" "}
          {order.customerName}
        </p>

        <p className="text-white">
          <strong>Pickup:</strong>{" "}
          {order.pickupAddress}
        </p>

        <p className="text-white">
          <strong>Delivery:</strong>{" "}
          {order.deliveryAddress}
        </p>

        <p className="text-white">
          <strong>Item:</strong>{" "}
          {order.itemDescription}
        </p>

      </div>

      <div className="mt-8">

        {order.status ===
          "supplier_assigned" && (
          <button
            onClick={handleAccept}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg"
          >
            Accept Order
          </button>
        )}

        {order.status ===
          "supplier_accepted" && (
          <button
            onClick={handleReady}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
          >
            Ready For Pickup
          </button>
        )}

      </div>

    </div>
  );
}