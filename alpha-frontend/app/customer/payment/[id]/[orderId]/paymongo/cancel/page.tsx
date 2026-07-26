"use client";

import Link from "next/link";
import {
  useParams,
  useSearchParams,
} from "next/navigation";

export default function PayMongoCancelPage() {
  const params = useParams<{
    orderId: string;
  }>();

  const searchParams = useSearchParams();

  /*
   * Prefer the order ID from the dynamic route:
   * /customer/payment/[orderId]/paymongo/cancel
   *
   * Keep the search-parameter fallback for older links:
   * /paymongo/cancel?orderId=...
   */
  const routeOrderId =
    typeof params.orderId === "string"
      ? params.orderId
      : "";

  const queryOrderId =
    searchParams.get("orderId") ?? "";

  const orderId =
    routeOrderId || queryOrderId;

  const retryPaymentUrl = orderId
    ? `/customer/payment/${orderId}`
    : "/customer/orders";

  const orderDetailsUrl = orderId
    ? `/customer/orders/${orderId}`
    : "/customer/orders";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="mb-4 text-center text-5xl">
          ⚠️
        </div>

        <h1 className="text-center text-2xl font-black">
          Payment Not Completed
        </h1>

        <p className="mt-4 text-center leading-6 text-slate-300">
          Your order was created, but the GCash
          payment was cancelled or was not completed.
        </p>

        {orderId ? (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-400">
            <span className="font-semibold text-slate-300">
              Order ID:
            </span>{" "}
            <span className="break-all">
              {orderId}
            </span>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            The order ID is missing from this payment
            link.
          </div>
        )}

        <div className="mt-6 space-y-3">
          {orderId && (
            <Link
              href={retryPaymentUrl}
              className="block rounded-xl bg-emerald-500 px-4 py-3 text-center font-bold text-black transition hover:bg-emerald-400"
            >
              Try GCash Again
            </Link>
          )}

          <Link
            href={orderDetailsUrl}
            className="block rounded-xl border border-slate-600 px-4 py-3 text-center font-bold text-slate-200 transition hover:bg-slate-800"
          >
            {orderId
              ? "View Order"
              : "View My Orders"}
          </Link>

          <Link
            href="/customer"
            className="block px-4 py-3 text-center text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Return to Customer Home
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Your order remains unpaid until PayMongo
          confirms a successful payment.
        </p>
      </div>
    </main>
  );
}