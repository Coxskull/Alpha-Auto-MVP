"use client";

import { useState } from "react";
import { createOrder } from "@/services/orders";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [zone, setZone] = useState("34");

  const [itemSubtotal, setItemSubtotal] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  async function submit() {
    const order = await createOrder({
      customerName,
      pickupAddress,
      deliveryAddress,
      itemDescription,
      zone,
      itemSubtotal,
      currency: selectedCurrency,
      paymentMethod: selectedPaymentMethod,
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
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Pickup Address"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Delivery Address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Part Description"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Item Subtotal"
          value={itemSubtotal}
          onChange={(e) => setItemSubtotal(Number(e.target.value))}
          className="w-full border rounded-xl p-3"
        />

        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="MXN">MXN - Mexican Peso</option>
        </select>

        <select
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank">Bank Transfer</option>
          <option value="stripe">Stripe</option>
        </select>

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