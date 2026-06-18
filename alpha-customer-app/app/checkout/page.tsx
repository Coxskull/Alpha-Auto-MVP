"use client";

import { useState } from "react";
import { createOrder } from "@/services/orders";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [customerName, setCustomerName] =
    useState("");

  const [pickupAddress, setPickupAddress] =
    useState("");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [itemDescription, setItemDescription] =
    useState("");

  const [zone, setZone] = useState("34");

  async function submit() {
    const order = await createOrder({
      customerName,
      pickupAddress,
      deliveryAddress,
      itemDescription,
      zone,
    });

    router.push(`/tracking/${order.id}`);
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Checkout
      </h1>

      <div className="space-y-4">
        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Pickup Address"
          value={pickupAddress}
          onChange={(e) =>
            setPickupAddress(e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Delivery Address"
          value={deliveryAddress}
          onChange={(e) =>
            setDeliveryAddress(e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Part Description"
          value={itemDescription}
          onChange={(e) =>
            setItemDescription(e.target.value)
          }
          className="w-full border rounded-xl p-3"
        />

        <button
          onClick={submit}
          className="w-full bg-emerald-500 py-3 rounded-xl font-bold"
        >
          Create Order
        </button>
      </div>
    </main>
  );
}