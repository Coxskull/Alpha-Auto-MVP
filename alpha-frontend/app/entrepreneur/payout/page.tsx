"use client";

import { useEffect, useState } from "react";

type PayoutStatus =
  | "PENDING"
  | "APPROVED"
  | "PAID"
  | "CANCELED"
  | "ADJUSTED"
  | "REVERSED";

interface EntrepreneurPayout {
  id: string;
  batchNumber?: string;
  entrepreneurId?: string;
  periodStart: string;
  periodEnd: string;
  eligibleRevenue: number;
  rewardRate: number;
  rewardAmount: number;
  minimumPayout?: number;
  holdingPeriodDays?: number;
  status: PayoutStatus;
  approvedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  payoutMethod?: string | null;
  payoutReference?: string | null;
  currency?: string;
}

interface PayoutSummary {
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  totalEarned: number;
  nextPayoutDate?: string | null;
  minimumPayout: number;
  rewardRate: number;
  currency: string;
}

interface RawPayoutSummary {
  pendingAmount?: number | string | null;
  pending?: number | string | null;
  pendingPayout?: number | string | null;

  approvedAmount?: number | string | null;
  approved?: number | string | null;
  approvedPayout?: number | string | null;

  paidAmount?: number | string | null;
  paid?: number | string | null;
  totalPaid?: number | string | null;

  totalEarned?: number | string | null;
  totalReward?: number | string | null;
  totalRewards?: number | string | null;

  nextPayoutDate?: string | null;
  nextPayout?: string | null;

  minimumPayout?: number | string | null;
  minimumPayoutThreshold?: number | string | null;

  rewardRate?: number | string | null;
  rate?: number | string | null;

  currency?: string | null;
}

interface RawPayout {
  id: string | number;

  batchNumber?: string | null;
  payoutBatchNumber?: string | null;
  referenceNumber?: string | null;

  entrepreneurId?: string | null;

  periodStart?: string | null;
  startDate?: string | null;

  periodEnd?: string | null;
  endDate?: string | null;

  eligibleRevenue?: number | string | null;
  eligibleNetPlatformRevenue?: number | string | null;

  rewardRate?: number | string | null;
  rate?: number | string | null;

  rewardAmount?: number | string | null;
  payoutAmount?: number | string | null;
  amount?: number | string | null;

  minimumPayout?: number | string | null;
  minimumPayoutThreshold?: number | string | null;

  holdingPeriodDays?: number | string | null;
  holdingPeriod?: number | string | null;

  status?: string | null;

  approvedAt?: string | null;
  paidAt?: string | null;

  createdAt?: string | null;
  created?: string | null;

  payoutMethod?: string | null;
  paymentMethod?: string | null;

  payoutReference?: string | null;
  paymentReference?: string | null;

  currency?: string | null;
}

interface RawPayoutListResponse {
  items?: RawPayout[];
  payouts?: RawPayout[];
  data?: RawPayout[];
}

type RawPayoutResponse =
  | RawPayout[]
  | RawPayoutListResponse;

const API =
  process.env.NEXT_PUBLIC_API_URL || "";

/* =====================================================
   HELPERS
===================================================== */

function toNumber(
  value:
    | number
    | string
    | null
    | undefined
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalizeStatus(
  status: string | null | undefined
): PayoutStatus {
  const normalized =
    String(
      status ?? "PENDING"
    ).toUpperCase();

  switch (normalized) {
    case "APPROVED":
      return "APPROVED";

    case "PAID":
      return "PAID";

    case "CANCELED":
    case "CANCELLED":
      return "CANCELED";

    case "ADJUSTED":
      return "ADJUSTED";

    case "REVERSED":
      return "REVERSED";

    default:
      return "PENDING";
  }
}

function normalizeSummary(
  data: RawPayoutSummary
): PayoutSummary {
  return {
    pendingAmount: toNumber(
      data.pendingAmount ??
        data.pending ??
        data.pendingPayout
    ),

    approvedAmount: toNumber(
      data.approvedAmount ??
        data.approved ??
        data.approvedPayout
    ),

    paidAmount: toNumber(
      data.paidAmount ??
        data.paid ??
        data.totalPaid
    ),

    totalEarned: toNumber(
      data.totalEarned ??
        data.totalReward ??
        data.totalRewards
    ),

    nextPayoutDate:
      data.nextPayoutDate ??
      data.nextPayout ??
      null,

    minimumPayout: toNumber(
      data.minimumPayout ??
        data.minimumPayoutThreshold
    ),

    rewardRate: toNumber(
      data.rewardRate ??
        data.rate ??
        0.05
    ),

    currency:
      data.currency ??
      "USD",
  };
}

function normalizePayouts(
  data: RawPayoutResponse
): EntrepreneurPayout[] {
  const items = Array.isArray(data)
    ? data
    : data.items ??
      data.payouts ??
      data.data ??
      [];

  return items.map(
    (item): EntrepreneurPayout => ({
      id: String(item.id),

      batchNumber:
        item.batchNumber ??
        item.payoutBatchNumber ??
        item.referenceNumber ??
        undefined,

      entrepreneurId:
        item.entrepreneurId ??
        undefined,

      periodStart:
        item.periodStart ??
        item.startDate ??
        "",

      periodEnd:
        item.periodEnd ??
        item.endDate ??
        "",

      eligibleRevenue: toNumber(
        item.eligibleRevenue ??
          item.eligibleNetPlatformRevenue
      ),

      rewardRate: toNumber(
        item.rewardRate ??
          item.rate ??
          0.05
      ),

      rewardAmount: toNumber(
        item.rewardAmount ??
          item.payoutAmount ??
          item.amount
      ),

      minimumPayout: toNumber(
        item.minimumPayout ??
          item.minimumPayoutThreshold
      ),

      holdingPeriodDays: toNumber(
        item.holdingPeriodDays ??
          item.holdingPeriod ??
          7
      ),

      status: normalizeStatus(
        item.status
      ),

      approvedAt:
        item.approvedAt ??
        null,

      paidAt:
        item.paidAt ??
        null,

      createdAt:
        item.createdAt ??
        item.created ??
        new Date().toISOString(),

      payoutMethod:
        item.payoutMethod ??
        item.paymentMethod ??
        null,

      payoutReference:
        item.payoutReference ??
        item.paymentReference ??
        null,

      currency:
        item.currency ??
        "USD",
    })
  );
}

function formatMoney(
  amount: number,
  currency: string
): string {
  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatRate(
  rate: number
): string {
  return `${(
    rate * 100
  ).toFixed(2)}%`;
}

/* =====================================================
   PAGE
===================================================== */

export default function EntrepreneurPayoutPage() {
  const [payouts, setPayouts] =
    useState<EntrepreneurPayout[]>([]);

  const [summary, setSummary] =
    useState<PayoutSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const pageSize = 10;

  /*
   * Initial API request.
   *
   * The asynchronous function is created inside
   * the effect so React does not treat the effect
   * as synchronously calling setState.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialPayoutData() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const headers: HeadersInit = {
          "Content-Type":
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const [
          summaryResponse,
          payoutResponse,
        ] = await Promise.all([
          fetch(
            `${API}/api/entrepreneur/payouts/summary`,
            {
              method: "GET",
              headers,
            }
          ),

          fetch(
            `${API}/api/entrepreneur/payouts`,
            {
              method: "GET",
              headers,
            }
          ),
        ]);

        if (!summaryResponse.ok) {
          throw new Error(
            "Unable to load payout summary."
          );
        }

        if (!payoutResponse.ok) {
          throw new Error(
            "Unable to load payout history."
          );
        }

        const summaryData =
          (await summaryResponse.json()) as RawPayoutSummary;

        const payoutData =
          (await payoutResponse.json()) as RawPayoutResponse;

        if (cancelled) {
          return;
        }

        setSummary(
          normalizeSummary(
            summaryData
          )
        );

        setPayouts(
          normalizePayouts(
            payoutData
          )
        );

        setPage(1);
        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Unable to load Entrepreneur payouts."
          );
        }

        setLoading(false);
      }
    }

    void loadInitialPayoutData();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Refresh is intentionally an event handler.
   * This is separate from the initial useEffect so
   * React's set-state-in-effect rule does not complain.
   */
  async function refreshPayoutData() {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const headers: HeadersInit = {
        "Content-Type":
          "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const [
        summaryResponse,
        payoutResponse,
      ] = await Promise.all([
        fetch(
          `${API}/api/entrepreneur/payouts/summary`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `${API}/api/entrepreneur/payouts`,
          {
            method: "GET",
            headers,
          }
        ),
      ]);

      if (!summaryResponse.ok) {
        throw new Error(
          "Unable to load payout summary."
        );
      }

      if (!payoutResponse.ok) {
        throw new Error(
          "Unable to load payout history."
        );
      }

      const summaryData =
        (await summaryResponse.json()) as RawPayoutSummary;

      const payoutData =
        (await payoutResponse.json()) as RawPayoutResponse;

      setSummary(
        normalizeSummary(
          summaryData
        )
      );

      setPayouts(
        normalizePayouts(
          payoutData
        )
      );

      setPage(1);
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load Entrepreneur payouts."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        payouts.length /
          pageSize
      )
    );

  const paginatedPayouts =
    payouts.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
                />
              )
            )}
          </div>

          <div className="mt-8 h-96 animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">
              Unable to load payouts
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void refreshPayoutData();
              }}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Entrepreneur Payouts
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track your Entrepreneur Network rewards and payout history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void refreshPayoutData();
            }}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* Explanation */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              i
            </div>

            <div>
              <h2 className="font-semibold text-blue-900">
                How Entrepreneur rewards work
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Entrepreneur rewards are calculated from Alpha&apos;s
                eligible net platform revenue after applicable direct
                transaction costs. The current pilot reward rate is{" "}
                <strong>
                  {summary
                    ? formatRate(
                        summary.rewardRate
                      )
                    : "5.00%"}
                </strong>
                .
              </p>

              <p className="mt-2 text-xs text-blue-700">
                The reward amount shown below is calculated and
                finalized by Alpha&apos;s financial system. This page
                does not calculate or modify your reward.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Pending"
            amount={formatMoney(
              summary?.pendingAmount ?? 0,
              summary?.currency ?? "USD"
            )}
            description="Awaiting payout eligibility"
          />

          <SummaryCard
            title="Approved"
            amount={formatMoney(
              summary?.approvedAmount ?? 0,
              summary?.currency ?? "USD"
            )}
            description="Approved for payout"
          />

          <SummaryCard
            title="Total Earned"
            amount={formatMoney(
              summary?.totalEarned ?? 0,
              summary?.currency ?? "USD"
            )}
            description={`Entrepreneur rewards at ${
              summary
                ? formatRate(
                    summary.rewardRate
                  )
                : "5.00%"
            }`}
          />

          <SummaryCard
            title="Total Paid"
            amount={formatMoney(
              summary?.paidAmount ?? 0,
              summary?.currency ?? "USD"
            )}
            description="Successfully paid"
          />

        </div>

        {/* Payout Information */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <InfoCard
            label="Reward Rate"
            value={
              summary
                ? formatRate(
                    summary.rewardRate
                  )
                : "5.00%"
            }
          />

          <InfoCard
            label="Minimum Payout"
            value={formatMoney(
              summary?.minimumPayout ?? 0,
              summary?.currency ?? "USD"
            )}
          />

          <InfoCard
            label="Next Payout"
            value={
              summary?.nextPayoutDate
                ? formatDate(
                    summary.nextPayoutDate
                  )
                : "Pending"
            }
          />

        </div>

        {/* Payout History */}
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-5 md:px-6">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payout History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Transparent ledger of Entrepreneur Network payout batches.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {payouts.length} payout
                {payouts.length === 1
                  ? ""
                  : "s"}
              </div>
            </div>
          </div>

          {payouts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <TableHeader>
                        Batch
                      </TableHeader>

                      <TableHeader>
                        Period
                      </TableHeader>

                      <TableHeader>
                        Eligible Revenue
                      </TableHeader>

                      <TableHeader>
                        Rate
                      </TableHeader>

                      <TableHeader>
                        Reward
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Paid
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedPayouts.map(
                      (payout) => (
                        <tr
                          key={payout.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payout.batchNumber ??
                                `#${payout.id.slice(
                                  0,
                                  8
                                )}`}
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              Created{" "}
                              {formatDate(
                                payout.createdAt
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(
                                payout.periodStart
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              to{" "}
                              {formatDate(
                                payout.periodEnd
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {formatMoney(
                              payout.eligibleRevenue,
                              payout.currency ??
                                "USD"
                            )}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {formatRate(
                              payout.rewardRate
                            )}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatMoney(
                                payout.rewardAmount,
                                payout.currency ??
                                  "USD"
                              )}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <StatusBadge
                              status={
                                payout.status
                              }
                            />
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {payout.paidAt
                              ? formatDate(
                                  payout.paidAt
                                )
                              : "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-gray-200 md:hidden">
                {paginatedPayouts.map(
                  (payout) => (
                    <div
                      key={payout.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {payout.batchNumber ??
                              `#${payout.id.slice(
                                0,
                                8
                              )}`}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(
                              payout.periodStart
                            )}{" "}
                            –{" "}
                            {formatDate(
                              payout.periodEnd
                            )}
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            payout.status
                          }
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">

                        <MobileMetric
                          label="Eligible Revenue"
                          value={formatMoney(
                            payout.eligibleRevenue,
                            payout.currency ??
                              "USD"
                          )}
                        />

                        <MobileMetric
                          label="Reward Rate"
                          value={formatRate(
                            payout.rewardRate
                          )}
                        />

                        <MobileMetric
                          label="Reward"
                          value={formatMoney(
                            payout.rewardAmount,
                            payout.currency ??
                              "USD"
                          )}
                        />

                        <MobileMetric
                          label="Paid"
                          value={
                            payout.paidAt
                              ? formatDate(
                                  payout.paidAt
                                )
                              : "—"
                          }
                        />

                      </div>

                      {payout.payoutMethod && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">
                            Payout Method
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {
                              payout.payoutMethod
                            }
                          </p>

                          {payout.payoutReference && (
                            <p className="mt-1 break-all text-xs text-gray-500">
                              Reference:{" "}
                              {
                                payout.payoutReference
                              }
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">

                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-500">
                    Page {page} of{" "}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.min(
                            totalPages,
                            current + 1
                          )
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>
              )}
            </>
          )}
        </div>

        {/* Rules */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Payout Rules
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            <Rule
              number="01"
              title="Revenue Eligibility"
              description="Alpha first records its marketplace commission and applicable direct transaction costs before determining Entrepreneur reward eligibility."
            />

            <Rule
              number="02"
              title="Holding Period"
              description={`Eligible rewards normally observe a ${
                payouts[0]
                  ?.holdingPeriodDays ?? 7
              }-day holding period before becoming payable.`}
            />

            <Rule
              number="03"
              title="Payout Schedule"
              description="Payout batches are processed twice monthly, normally around the 15th and month-end, subject to eligibility and the configured minimum threshold."
            />

          </div>
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function SummaryCard({
  title,
  amount,
  description,
}: {
  title: string;
  amount: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
        {amount}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: PayoutStatus;
}) {
  const styles: Record<
    PayoutStatus,
    string
  > = {
    PAID:
      "bg-green-100 text-green-700",

    APPROVED:
      "bg-blue-100 text-blue-700",

    PENDING:
      "bg-yellow-100 text-yellow-700",

    ADJUSTED:
      "bg-purple-100 text-purple-700",

    REVERSED:
      "bg-red-100 text-red-700",

    CANCELED:
      "bg-red-100 text-red-700",
  };

  const labels: Record<
    PayoutStatus,
    string
  > = {
    PAID: "Paid",
    APPROVED: "Approved",
    PENDING: "Pending",
    ADJUSTED: "Adjusted",
    REVERSED: "Reversed",
    CANCELED: "Canceled",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
    >
      {children}
    </th>
  );
}

function MobileMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Rule({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-400">
          {number}
        </span>

        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <span className="text-xl text-gray-400">
          $
        </span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No payouts yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Your Entrepreneur Network rewards will appear here once
        an eligible payout batch has been generated.
      </p>
    </div>
  );
}