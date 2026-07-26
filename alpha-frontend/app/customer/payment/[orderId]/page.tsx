"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  capturePayPalOrder,
  createPayPalOrder,
} from "@/services/paypal";

import {
  createPayMongoCheckout,
} from "@/services/paymongo";

import api from "@/services/api";

type PaymentDetails = {
  orderId: string;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
};

export default function PaymentPage() {
  const params = useParams<{
    orderId: string;
  }>();

  const router = useRouter();

  const orderId =
    typeof params.orderId === "string"
      ? params.orderId
      : "";

  const paypalClientId =
    process.env
      .NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const [payment, setPayment] =
    useState<PaymentDetails | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [redirecting, setRedirecting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    async function loadPayment() {
      try {
        const response =
          await api.get(
            `/api/paymongo/orders/${orderId}/payment-status`
          );

        if (cancelled) {
          return;
        }

        setPayment({
          orderId,
          currency:
            response.data.currency ??
            "PHP",
          paymentMethod:
            response.data.paymentMethod ??
            response.data.paymentGateway ??
            "",
          paymentStatus:
            response.data.paymentStatus ??
            "pending",
          amount:
            Number(
              response.data.amount ?? 0
            ),
        });
      } catch (loadError) {
        if (!cancelled) {
          console.error(loadError);
          setError(
            "Unable to load payment details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPayment();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function continueToGCash() {
    setRedirecting(true);
    setError("");

    try {
      const checkout =
        await createPayMongoCheckout(
          orderId
        );

      if (!checkout.checkoutUrl) {
        throw new Error(
          "PayMongo did not return a checkout URL."
        );
      }

      window.location.assign(
        checkout.checkoutUrl
      );
    } catch (checkoutError) {
      console.error(checkoutError);

      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to open GCash checkout."
      );

      setRedirecting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <p>Loading payment...</p>
      </main>
    );
  }

  const isPayMongo =
    payment?.paymentMethod ===
      "paymongo_gcash" ||
    payment?.paymentMethod ===
      "paymongo";

  if (isPayMongo) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h1 className="text-2xl font-black">
            Complete GCash Payment
          </h1>

          <p className="mt-3 text-slate-400">
            Continue to PayMongo to securely
            complete your payment.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={redirecting}
            onClick={() =>
              void continueToGCash()
            }
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-bold text-black disabled:opacity-60"
          >
            {redirecting
              ? "Opening GCash..."
              : "Continue to GCash"}
          </button>
        </div>
      </main>
    );
  }

  if (!paypalClientId) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <p className="text-red-300">
          PayPal client ID is missing.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-black">
          Complete PayPal Payment
        </h1>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4">
          <PayPalScriptProvider
            options={{
              clientId:
                paypalClientId,
              currency:
                payment?.currency ??
                "USD",
              intent: "capture",
            }}
          >
            <PayPalButtons
              createOrder={() =>
                createPayPalOrder(
                  orderId
                )
              }
              onApprove={async data => {
                if (!data.orderID) {
                  setError(
                    "Missing PayPal order ID."
                  );
                  return;
                }

                await capturePayPalOrder(
                  orderId,
                  data.orderID
                );

                router.push(
                  `/customer/orders/${orderId}?paid=1`
                );
              }}
              onError={paypalError => {
                console.error(
                  paypalError
                );

                setError(
                  "PayPal failed to process the payment."
                );
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </main>
  );
}