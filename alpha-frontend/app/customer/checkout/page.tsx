"use client";

import { useMemo, useState } from "react";
import { createOrder } from "@/services/orders";
import { useRouter } from "next/navigation";
import { clearCart, getCart } from "@/services/cart";

export default function CheckoutPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [zone] = useState("34");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cart = getCart();

  const itemDescription = useMemo(() => {
  return cart
    .map((item) => `${item.quantity}x ${item.productName}`)
    .join(", ");
}, [cart]);

  const itemSubtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cart]);

  const deliveryFee = 5;
  const serviceFee = 3;
  const tax = 0;
  const discount = 0;

  const totalAmount = itemSubtotal + deliveryFee + serviceFee + tax - discount;

  async function submit() {
    setError("");

    if (!customerName || !pickupAddress || !deliveryAddress) {
      setError("Please complete all required fields.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (itemSubtotal <= 0) {
      setError("Cart total must be greater than 0.");
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
        currency: selectedCurrency,
        paymentMethod: selectedPaymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      const orderId = response?.order?.id || response?.id;

      if (!orderId) {
        throw new Error("Order was created but no order ID was returned.");
      }

      if (selectedPaymentMethod === "paypal") {
        router.push(`/customer/payment/${orderId}`);
        return;
      }

      clearCart();
      router.push(`/customer/orders/${orderId}`);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] p-4 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-black">Checkout</h1>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border bg-white p-3 text-black"
          />

          <input
            placeholder="Pickup Address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="w-full rounded-xl border bg-white p-3 text-black"
          />

          <input
            placeholder="Delivery Address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full rounded-xl border bg-white p-3 text-black"
          />

          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full rounded-xl border bg-white p-3 text-black"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="MXN">MXN - Mexican Peso</option>
          </select>

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="w-full rounded-xl border bg-white p-3 text-black"
          >
            <option value="cash">Cash</option>
            <option value="paypal">PayPal Sandbox</option>
            <option value="card" disabled>
              Card - Coming Soon
            </option>
            <option value="bank" disabled>
              Bank Transfer - Coming Soon
            </option>
            <option value="stripe" disabled>
              Stripe - Coming Soon
            </option>
          </select>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm">
            <p className="mb-3 font-bold text-slate-300">Order Items</p>

            {cart.length === 0 ? (
              <p className="text-slate-400">Your cart is empty.</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between gap-3 text-slate-300"
                  >
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>
                      {selectedCurrency}{" "}
                      {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span>
                {selectedCurrency} {itemSubtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>
                {selectedCurrency} {deliveryFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>
                {selectedCurrency} {serviceFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>
                {selectedCurrency} {tax.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-700 pt-2 flex justify-between text-base font-black">
              <span>Total</span>
              <span>
                {selectedCurrency} {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading || cart.length === 0}
            className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black disabled:bg-slate-600"
          >
            {loading
              ? "Creating Order..."
              : selectedPaymentMethod === "paypal"
              ? "Continue to PayPal"
              : "Create Order"}
          </button>
        </div>
      </div>
    </main>
  );
}