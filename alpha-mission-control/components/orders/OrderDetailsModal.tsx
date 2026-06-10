"use client";

import { Order } from "@/types/dashboard";

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

export default function OrderDetailsModal({
  open,
  onClose,
  order,
}: Props) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl bg-[#111827] rounded-3xl p-8 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Order Details
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500">Order #</p>
            <p className="text-white">
              {order.orderNumber}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Customer</p>
            <p className="text-white">
              {order.customerName}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>
            <p className="text-white">
              {order.status}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Supplier</p>
            <p className="text-white">
              {order.supplierName ??
                "Not Assigned"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Driver</p>
            <p className="text-white">
              {order.driverName ??
                "Not Assigned"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Zone</p>
            <p className="text-white">
              {order.zone}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-gray-500">Pickup</p>
            <p className="text-white">
              {order.pickupAddress}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-gray-500">Delivery</p>
            <p className="text-white">
              {order.deliveryAddress}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-gray-500">
              Item Description
            </p>
            <p className="text-white">
              {order.itemDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}