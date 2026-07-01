"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { capturePayPalOrder, createPayPalOrder } from "@/services/paypal";

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const orderId = params.id;
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const [error, setError] = useState("");

  if (!clientId) {
    return (
      <main className="min-h-screen bg-[#020617] text-white p-6">
        <h1 className="text-2xl font-black">PayPal Setup Missing</h1>
        <p className="mt-4 text-red-300">
          NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing in Vercel environment variables.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
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

        <div className="rounded-2xl bg-white p-4">
          <PayPalScriptProvider
            options={{
              clientId,
              currency: "USD",
              intent: "capture",
            }}
          >
            <PayPalButtons
              style={{
                layout: "vertical",
                shape: "rect",
              }}
              createOrder={async () => {
                return await createPayPalOrder(orderId);
              }}
              onApprove={async (data) => {
                if (!data.orderID) {
                  setError("Missing PayPal order ID.");
                  return;
                }

                await capturePayPalOrder(orderId, data.orderID);

                router.push(`/customer/orders/${orderId}?paid=1`);
              }}
              onError={(err) => {
                console.error(err);
                setError("PayPal failed to load or process payment.");
              }}
              onCancel={() => {
                setError("Payment was cancelled.");
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </main>
  );
}