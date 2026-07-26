"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { clearCart } from "@/services/cart";
import api from "@/services/api";

type PaymentStatusResponse = {
  orderId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  status?: string;
  message?: string;
  isPaid?: boolean;
};

type PageStatus =
  | "checking"
  | "paid"
  | "pending"
  | "failed";

function getPaymentStatus(
  response: PaymentStatusResponse
): string {
  return (
    response.paymentStatus ??
    response.status ??
    ""
  )
    .trim()
    .toLowerCase();
}

function getErrorMessage(
  error: unknown
): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?:
          | string
          | {
              message?: string;
              error?: string;
            };
      };
    };

    const data = axiosError.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to confirm the payment.";
}

export default function PayMongoSuccessPage() {
  const router = useRouter();

  const params = useParams<{
    orderId: string;
    sessionId: string;
  }>();

  const orderId =
    typeof params.orderId === "string"
      ? params.orderId
      : "";

  const sessionId =
    typeof params.sessionId === "string"
      ? params.sessionId
      : "";

  const missingParameters =
    !orderId || !sessionId;

  const [pageStatus, setPageStatus] =
    useState<PageStatus>("checking");

  const [message, setMessage] =
    useState(
      "Confirming your GCash payment..."
    );

  useEffect(() => {
    /*
     * Do not call setState for missing parameters here.
     * The missing-parameter state is derived during rendering.
     */
    if (missingParameters) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<
      typeof setTimeout
    > | null = null;

    const maximumAttempts = 10;
    const pollingInterval = 3000;

    async function confirmPayment(
      attempt: number
    ): Promise<void> {
      try {
        /*
         * Change this URL if your backend payment-status
         * endpoint uses a different route.
         */
        const response =
          await api.get<PaymentStatusResponse>(
            `/api/PayMongo/orders/${orderId}/payment-status`,
            {
              params: {
                sessionId,
              },
            }
          );

        if (cancelled) {
          return;
        }

        const result = response.data;
        const paymentStatus =
          getPaymentStatus(result);

        const paymentIsSuccessful =
          result.isPaid === true ||
          paymentStatus === "paid" ||
          paymentStatus === "succeeded" ||
          paymentStatus === "completed";

        const paymentHasFailed =
          paymentStatus === "failed" ||
          paymentStatus === "cancelled" ||
          paymentStatus === "canceled" ||
          paymentStatus === "expired";

        if (paymentIsSuccessful) {
          clearCart();

          setPageStatus("paid");
          setMessage(
            result.message ??
              "Your GCash payment was confirmed successfully."
          );

          return;
        }

        if (paymentHasFailed) {
          setPageStatus("failed");
          setMessage(
            result.message ??
              "The payment was not completed."
          );

          return;
        }

        if (attempt >= maximumAttempts) {
          setPageStatus("pending");
          setMessage(
            "Your payment is still being verified. You may open your order to check its latest status."
          );

          return;
        }

        setPageStatus("checking");
        setMessage(
          `Confirming your GCash payment... (${attempt}/${maximumAttempts})`
        );

        timeoutId = setTimeout(() => {
          void confirmPayment(attempt + 1);
        }, pollingInterval);
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        if (attempt < maximumAttempts) {
          setMessage(
            `Waiting for payment confirmation... (${attempt}/${maximumAttempts})`
          );

          timeoutId = setTimeout(() => {
            void confirmPayment(attempt + 1);
          }, pollingInterval);

          return;
        }

        console.error(
          "Payment confirmation failed:",
          error
        );

        setPageStatus("pending");
        setMessage(getErrorMessage(error));
      }
    }

    void confirmPayment(1);

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    missingParameters,
    orderId,
    sessionId,
  ]);

  if (missingParameters) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 text-center">
          <div className="mb-4 text-4xl">
            ⚠️
          </div>

          <h1 className="text-xl font-black">
            Invalid payment link
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            The order ID or PayMongo session ID is
            missing from the payment link.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/customer/orders"
              )
            }
            className="mt-6 w-full rounded-xl bg-slate-700 py-3 font-bold text-white hover:bg-slate-600"
          >
            View Orders
          </button>
        </div>
      </main>
    );
  }

  const isChecking =
    pageStatus === "checking";

  const isPaid =
    pageStatus === "paid";

  const isFailed =
    pageStatus === "failed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-xl">
        <div className="mb-4 text-5xl">
          {isChecking
            ? "⏳"
            : isPaid
              ? "✅"
              : isFailed
                ? "❌"
                : "🕒"}
        </div>

        <h1 className="text-2xl font-black">
          {isChecking
            ? "Confirming Payment"
            : isPaid
              ? "Payment Successful"
              : isFailed
                ? "Payment Failed"
                : "Payment Pending"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {message}
        </p>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-3 text-left text-xs text-slate-400">
          <p>
            <span className="font-bold text-slate-300">
              Order:
            </span>{" "}
            {orderId}
          </p>

          <p className="mt-1">
            <span className="font-bold text-slate-300">
              Payment session:
            </span>{" "}
            {sessionId}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/customer/orders/${orderId}`
              )
            }
            className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black hover:bg-emerald-400"
          >
            View Order
          </button>

          {!isPaid && (
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="w-full rounded-xl border border-slate-600 py-3 font-bold text-slate-200 hover:bg-slate-800"
            >
              Check Again
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              router.push("/customer")
            }
            className="w-full rounded-xl py-3 text-sm font-medium text-slate-400 hover:text-white"
          >
            Return to Customer Home
          </button>
        </div>
      </div>
    </main>
  );
}