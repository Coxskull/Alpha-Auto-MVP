"use client";

import { Order } from "@/types/order";
import {
  markPickedUp,
  markEnRoute,
  markDelivered,
} from "@/services/orders";

type Props = {
  order: Order;
  onRefresh: () => Promise<void>;
};

export default function OrderCard({
  order,
  onRefresh,
}: Props) {
  async function handleAction() {
    if (order.status === "driver_assigned") {
      await markPickedUp(order.id);
    }

    if (order.status === "picked_up") {
      await markEnRoute(order.id);
    }

    if (order.status === "en_route") {
      await markDelivered(order.id);
    }

    await onRefresh();
  }

  const buttonLabel =
    order.status === "driver_assigned"
      ? "Picked Up"
      : order.status === "picked_up"
      ? "En Route"
      : order.status === "en_route"
      ? "Delivered"
      : "Completed";

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {order.orderNumber}
          </h3>

          <p className="text-gray-400 mt-1">
            {order.itemDescription}
          </p>
        </div>

        <span className="text-green-400 text-sm">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-[#0B0F14] rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase">
            Pickup
          </p>
          <p className="text-white mt-2">
            {order.pickupAddress}
          </p>
        </div>

        <div className="bg-[#0B0F14] rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase">
            Drop-off
          </p>
          <p className="text-white mt-2">
            {order.deliveryAddress}
          </p>
        </div>
      </div>

      {order.status !== "delivered" && (
        <button
          onClick={handleAction}
          className="mt-6 w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}