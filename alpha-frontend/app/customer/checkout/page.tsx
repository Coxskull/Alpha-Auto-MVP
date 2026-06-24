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
  const [zone] = useState("34");

  const [itemSubtotal, setItemSubtotal] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");

    if (!customerName || !pickupAddress || !deliveryAddress || !itemDescription) {
      setError("Please complete all required fields.");
      return;
    }

    if (itemSubtotal <= 0) {
      setError("Item subtotal must be greater than 0.");
      return;
    }

    try {
      setLoading(true);

      const response = await createOrder({
        customerName,
        pickupAddress,
        deliveryAddress,
        itemDescription,
        zone,
        itemSubtotal,
        currency: selectedCurrency,
        paymentMethod: selectedPaymentMethod,
      });

      console.log("Create order response:", response);

      const orderId = response?.order?.id || response?.id;

      if (!orderId) {
        throw new Error("Order was created but no order ID was returned.");
      }

      router.push(`/customer/tracking/${orderId}`);
    } catch (err: unknown) {
      console.error("Create order failed:", err);

  let message = "Failed to create order.";

  if (err && typeof err === "object" && "response" in err) {
    const axiosError = err as {
      response?: {
        data?: {
          message?: string;
        } | string;
      };
    };

    if (typeof axiosError.response?.data === "string") {
      message = axiosError.response.data;
    } else if (axiosError.response?.data?.message) {
      message = axiosError.response.data.message;
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  setError(message);
}
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black mb-6">
          Checkout
        </h1>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-white text-black border rounded-xl p-3"
          />

          <input
            placeholder="Pickup Address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="w-full bg-white text-black border rounded-xl p-3"
          />

          <input
            placeholder="Delivery Address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full bg-white text-black border rounded-xl p-3"
          />

          <input
            placeholder="Part Description"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            className="w-full bg-white text-black border rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Item Subtotal"
            value={itemSubtotal}
            onChange={(e) =>
              setItemSubtotal(Number(e.target.value))
            }
            className="w-full bg-white text-black border rounded-xl p-3"
          />

          <select
            value={selectedCurrency}
            onChange={(e) =>
              setSelectedCurrency(e.target.value)
            }
            className="w-full bg-white text-black border rounded-xl p-3"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="MXN">MXN - Mexican Peso</option>
          </select>

          <select
            value={selectedPaymentMethod}
            onChange={(e) =>
              setSelectedPaymentMethod(e.target.value)
            }
            className="w-full bg-white text-black border rounded-xl p-3"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="stripe">Stripe</option>
          </select>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-emerald-500 disabled:bg-slate-600 text-black py-3 rounded-xl font-bold"
          >
            {loading ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      </div>
    </main>
  );
}