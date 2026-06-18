"use client";

import { useState } from "react";
import api from "@/services/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddOrderModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    pickupAddress: "",
    deliveryAddress: "",
    itemDescription: "",
    zone: "",
  });

  if (!open) return null;

  const createOrder = async () => {
    try {
      setLoading(true);

      await api.post("/api/Orders", {
        customerName: form.customerName,
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        itemDescription: form.itemDescription,
        zone: form.zone,
      });

      onCreated();
      onClose();

      setForm({
        customerName: "",
        pickupAddress: "",
        deliveryAddress: "",
        itemDescription: "",
        zone: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0B0F14] w-full max-w-xl rounded-3xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">
          Create Order
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Customer Name"
            value={form.customerName}
            onChange={(e) =>
              setForm({
                ...form,
                customerName: e.target.value,
              })
            }
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Pickup Address"
            value={form.pickupAddress}
            onChange={(e) =>
              setForm({
                ...form,
                pickupAddress: e.target.value,
              })
            }
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Delivery Address"
            value={form.deliveryAddress}
            onChange={(e) =>
              setForm({
                ...form,
                deliveryAddress: e.target.value,
              })
            }
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Item Description"
            value={form.itemDescription}
            onChange={(e) =>
              setForm({
                ...form,
                itemDescription: e.target.value,
              })
            }
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Zone"
            value={form.zone}
            onChange={(e) =>
              setForm({
                ...form,
                zone: e.target.value,
              })
            }
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-gray-700 text-white"
          >
            Cancel
          </button>

          <button
            onClick={createOrder}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-green-500 text-black font-semibold"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}