"use client";

import { Order } from "@/types/order";
import {
  markPickedUp,
  markEnRoute,
  markDelivered,
} from "@/services/orders";
import DeliveryProgress from "./DeliveryProgress";
import ProofUpload from "./ProofUpload";

type Props = {
  order: Order;
  onRefresh: () => Promise<void>;
};

export default function ActiveDeliveryCard({
  order,
  onRefresh,
}: Props) {
  async function handlePickedUp() {
    await markPickedUp(order.id);
    await onRefresh();
  }

  async function handleEnRoute() {
    await markEnRoute(order.id);
    await onRefresh();
  }

  async function handleDelivered() {
    await markDelivered(order.id);
    await onRefresh();
  }

  return (
    <div className="space-y-5">
      <div className="bg-green-700 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-white text-2xl font-bold">
            Active Delivery
          </h2>

          <p className="text-green-100 mt-1">
            Order {order.orderNumber}
          </p>
        </div>

        <div className="text-right">
          <p className="text-green-100 text-sm">
            Status
          </p>

          <p className="text-white text-xl font-bold">
            {order.status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <p className="text-green-400 font-semibold">
            Pickup
          </p>

          <h3 className="text-white text-xl font-bold mt-2">
            Supplier
          </h3>

          <p className="text-gray-300 mt-1">
            {order.pickupAddress}
          </p>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <p className="text-green-400 font-semibold">
            Drop-off
          </p>

          <h3 className="text-white text-xl font-bold mt-2">
            {order.customerName}
          </h3>

          <p className="text-gray-300 mt-1">
            {order.deliveryAddress}
          </p>
        </div>
      </div>

      <DeliveryProgress status={order.status} />

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">
          Update Delivery Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handlePickedUp}
            disabled={
              order.status !== "driver_assigned"
            }
            className={`py-3 rounded-xl font-bold ${
              order.status === "driver_assigned"
                ? "bg-cyan-500 text-black"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Picked Up
          </button>

          <button
            onClick={handleEnRoute}
            disabled={order.status !== "picked_up"}
            className={`py-3 rounded-xl font-bold ${
              order.status === "picked_up"
                ? "bg-orange-500 text-black"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            En Route
          </button>

          <button
            onClick={handleDelivered}
            disabled={order.status !== "en_route"}
            className={`py-3 rounded-xl font-bold ${
              order.status === "en_route"
                ? "bg-green-500 text-black"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {order.status === "en_route" && (
        <ProofUpload
          orderId={order.id}
          onUploaded={onRefresh}
        />
      )}

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">
          Order Details
        </h3>

        <p className="text-gray-300">
          {order.itemDescription}
        </p>

        <p className="text-gray-500 mt-2">
          Customer: {order.customerName}
        </p>
      </div>
    </div>
  );
}