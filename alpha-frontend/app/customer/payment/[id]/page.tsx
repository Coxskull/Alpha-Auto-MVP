// app/customer/payment/[id]/page.tsx
"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { capturePayPalOrder, createPayPalOrder } from "@/services/paypal";

export default function CustomerPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const [error, setError] = useState("");

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-black">Complete Payment</h1>
          <p className="text-sm text-slate-400">
            Pay securely using PayPal Sandbox.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <PayPalScriptProvider
          options={{
            clientId,
            currency: "USD",
            intent: "capture",
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect" }}
            createOrder={async () => {
              return await createPayPalOrder(orderId);
            }}
            onApprove={async (data) => {
              if (!data.orderID) {
                setError("Missing PayPal order ID.");
                return;
              }

              await capturePayPalOrder(orderId, data.orderID);
              router.push(`/customer/tracking/${orderId}?paid=1`);
            }}
            onCancel={() => {
              setError("Payment cancelled.");
            }}
            onError={(err) => {
              console.error(err);
              setError("Payment failed. Please try again.");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </main>
  );
}