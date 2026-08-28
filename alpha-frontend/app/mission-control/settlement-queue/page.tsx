"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPendingSettlements,
  getSettlementQueue,
  markSettlementPaid,
  verifySettlement,
  type ApiErrorResponse,
  type PendingSettlementItem,
  type SettlementItem,
} from "@/services/financials";

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const candidate =
      error as {
        response?: {
          data?: ApiErrorResponse;
        };
        message?: string;
      };

    return (
      candidate.response?.data?.message ??
      candidate.response?.data?.detail ??
      candidate.response?.data?.error ??
      candidate.response?.data?.title ??
      candidate.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function formatMoney(
  value: number | null | undefined,
  currency = "USD"
): string {
  return new Intl.NumberFormat(
    undefined,
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(Number(value ?? 0));
}

function getStatusClass(
  status: string
): string {
  switch (status.toLowerCase()) {
    case "settlement_pending":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

    case "pending_review":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

    case "ready_for_payout":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";

    case "paid":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    case "blocked":
    case "settlement_exception":
    case "failed":
      return "border-red-500/20 bg-red-500/10 text-red-300";

    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

function formatStatus(
  status: string
): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function SettlementQueuePage() {
  const [pending, setPending] =
    useState<PendingSettlementItem[]>([]);

  const [queue, setQueue] =
    useState<SettlementItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [verifyingId, setVerifyingId] =
    useState<string | null>(null);

  const [payingId, setPayingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadSettlements =
    useCallback(async () => {
      try {
        setError(null);

        const [
          pendingData,
          queueData,
        ] = await Promise.all([
          getPendingSettlements(),
          getSettlementQueue(),
        ]);

        setPending(pendingData);
        setQueue(queueData);
      } catch (error: unknown) {
        console.error(
          "Failed to load settlement data:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Failed to load settlement data."
          )
        );
      }
    }, []);

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setError(null);

        const [
          pendingData,
          queueData,
        ] = await Promise.all([
          getPendingSettlements(),
          getSettlementQueue(),
        ]);

        if (!active) {
          return;
        }

        setPending(pendingData);
        setQueue(queueData);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        console.error(
          "Failed to load settlement data:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Failed to load settlement data."
          )
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadSettlements();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleVerify(
    orderId: string
  ) {
    try {
      setVerifyingId(orderId);
      setError(null);

      const result =
        await verifySettlement(orderId);

      if (!result.success) {
        throw new Error(
          result.message ||
            "Settlement verification failed."
        );
      }

      await loadSettlements();
    } catch (error: unknown) {
      console.error(
        "Settlement verification failed:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Settlement verification failed."
        )
      );
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleMarkPaid(
    settlementId: string
  ) {
    try {
      setPayingId(settlementId);
      setError(null);

      await markSettlementPaid(
        settlementId
      );

      await loadSettlements();
    } catch (error: unknown) {
      console.error(
        "Failed to mark settlement paid:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Failed to mark settlement as paid."
        )
      );
    } finally {
      setPayingId(null);
    }
  }

  const unpaidQueueCount =
    queue.filter(
      (item) =>
        item.status.toLowerCase() !==
        "paid"
    ).length;

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              Settlement Queue
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Verify completed deliveries,
              reconcile financials, and process
              provider payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loading || refreshing
            }
            className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-bold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
            Loading settlement data...
          </div>
        ) : (
          <>
            {/* ========================================= */}
            {/* PENDING SETTLEMENTS */}
            {/* ========================================= */}

            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Pending Settlement Verification
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Completed orders with proof
                    uploaded and waiting for
                    financial verification.
                  </p>
                </div>

                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-300">
                  {pending.length}
                </span>
              </div>

              {pending.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                  No settlements are waiting for
                  verification.
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map(
                    (
                      item: PendingSettlementItem
                    ) => {
                      const financial =
                        item.financial;

                      const currency =
                        financial?.currency ??
                        item.currency ??
                        "USD";

                      const isVerifying =
                        verifyingId ===
                        item.orderId;

                      return (
                        <div
                          key={item.orderId}
                          className="rounded-2xl border border-yellow-500/20 bg-slate-900 p-5"
                        >
                          {/* Order heading */}
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-black">
                                  Order #
                                  {
                                    item.orderNumber
                                  }
                                </h3>

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                    item.status
                                  )}`}
                                >
                                  {formatStatus(
                                    item.status
                                  )}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-400">
                                Customer:{" "}
                                <span className="font-semibold text-white">
                                  {
                                    item.customerName
                                  }
                                </span>
                              </p>
                            </div>

                            <div className="lg:text-right">
                              <p className="text-xs text-slate-500">
                                Customer Paid
                              </p>

                              <p className="text-2xl font-black">
                                {formatMoney(
                                  financial?.customerPaid,
                                  currency
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Verification cards */}
                          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                              <p className="text-xs text-slate-500">
                                Payment
                              </p>

                              <p className="mt-1 font-bold text-emerald-300">
                                Paid
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                              <p className="text-xs text-slate-500">
                                Delivery Proof
                              </p>

                              <p className="mt-1 font-bold text-emerald-300">
                                {item.proof
                                  ? "Uploaded"
                                  : "Missing"}
                              </p>

                              {item.proof
                                ?.uploadedAt && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {new Date(
                                    item.proof.uploadedAt
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>

                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                              <p className="text-xs text-slate-500">
                                Supplier
                              </p>

                              <p
                                className={`mt-1 font-bold ${
                                  item.supplierId
                                    ? "text-emerald-300"
                                    : "text-red-300"
                                }`}
                              >
                                {item.supplierId
                                  ? "Assigned"
                                  : "Missing"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                              <p className="text-xs text-slate-500">
                                Driver
                              </p>

                              <p
                                className={`mt-1 font-bold ${
                                  item.driverId
                                    ? "text-emerald-300"
                                    : "text-red-300"
                                }`}
                              >
                                {item.driverId
                                  ? "Assigned"
                                  : "Missing"}
                              </p>
                            </div>
                          </div>

                          {/* Financial information */}
                          {financial && (
                            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                              <h4 className="mb-4 text-sm font-black">
                                Current Financial Record
                              </h4>

                              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Financial
                                  </p>

                                  <p className="mt-1 font-bold">
                                    {
                                      financial.financialStatus
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Settlement
                                  </p>

                                  <p className="mt-1 font-bold">
                                    {
                                      financial.settlementStatus
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Payout
                                  </p>

                                  <p className="mt-1 font-bold">
                                    {
                                      financial.payoutStatus
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Reconciliation
                                  </p>

                                  <p
                                    className={`mt-1 font-bold ${
                                      Math.abs(
                                        Number(
                                          financial.reconciliationDifference ??
                                            0
                                        )
                                      ) <=
                                      0.01
                                        ? "text-emerald-300"
                                        : "text-red-300"
                                    }`}
                                  >
                                    {formatMoney(
                                      financial.reconciliationDifference,
                                      currency
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            {item.proof
                              ?.imageUrl && (
                              <a
                                href={
                                  item.proof
                                    .imageUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-white/10 bg-slate-800 px-5 py-3 text-center text-sm font-bold transition hover:bg-slate-700"
                              >
                                View Delivery Proof
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleVerify(
                                  item.orderId
                                )
                              }
                              disabled={
                                isVerifying
                              }
                              className="flex-1 rounded-xl bg-blue-500 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                            >
                              {isVerifying
                                ? "Verifying Settlement..."
                                : "Verify Settlement"}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* ========================================= */}
            {/* SETTLEMENT QUEUE */}
            {/* ========================================= */}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Ready for Payout
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Verified settlement records
                    waiting for manual payout.
                  </p>
                </div>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-300">
                  {unpaidQueueCount}
                </span>
              </div>

              {queue.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                  No settlement queue items found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950 text-slate-300">
                      <tr>
                        <th className="p-4 text-left">
                          Payee
                        </th>

                        <th className="p-4 text-left">
                          Amount
                        </th>

                        <th className="p-4 text-left">
                          Status
                        </th>

                        <th className="p-4 text-left">
                          Created
                        </th>

                        <th className="p-4 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {queue.map(
                        (
                          item: SettlementItem
                        ) => {
                          const currency =
                            item.financial
                              ?.currency ??
                            "USD";

                          const isPaying =
                            payingId ===
                            item.id;

                          return (
                            <tr
                              key={item.id}
                              className="border-t border-white/10"
                            >
                              <td className="p-4">
                                <p className="font-bold capitalize">
                                  {
                                    item.payeeType
                                  }
                                </p>

                                {item.payeeId && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {
                                      item.payeeId
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="p-4 font-black">
                                {formatMoney(
                                  item.amount,
                                  currency
                                )}
                              </td>

                              <td className="p-4">
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                    item.status
                                  )}`}
                                >
                                  {formatStatus(
                                    item.status
                                  )}
                                </span>
                              </td>

                              <td className="p-4 text-slate-400">
                                {new Date(
                                  item.createdAt
                                ).toLocaleString()}
                              </td>

                              <td className="p-4 text-right">
                                {item.status.toLowerCase() !==
                                  "paid" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMarkPaid(
                                        item.id
                                      )
                                    }
                                    disabled={
                                      isPaying
                                    }
                                    className="rounded-xl bg-emerald-500 px-4 py-2 font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                                  >
                                    {isPaying
                                      ? "Processing..."
                                      : "Mark Paid"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}