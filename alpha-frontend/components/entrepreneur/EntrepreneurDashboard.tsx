"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  DollarSign,
  RefreshCw,
  Share2,
  ShoppingBag,
  UserCheck,
  Users,
} from "lucide-react";

import RoleGuard from "@/components/auth/RoleGuard";
import {
  getEntrepreneurDashboard,
} from "@/services/entrepreneurService";

import type {
  EntrepreneurDashboard as EntrepreneurDashboardType,
} from "@/types/entrepreneur";

function formatMoney(
  value: number,
  currency: string
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatPercentage(value: number): string {
  /*
   * Backend normally returns 0.05 for 5%.
   */
  return `${((value ?? 0) * 100).toFixed(2)}%`;
}

export default function EntrepreneurDashboard() {
  const [dashboard, setDashboard] =
    useState<EntrepreneurDashboardType | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /*
   * Load dashboard data.
   *
   * showLoading=true is used for the initial load.
   * Subsequent refreshes don't replace the dashboard
   * with a loading screen.
   */
  const loadDashboard = useCallback(
  async (showRefreshing = true) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }

      setError(null);

      const data = await getEntrepreneurDashboard();

      setDashboard(data);
    } catch (err) {
      console.error(
        "Failed to load entrepreneur dashboard:",
        err
      );

      setError(
        "Unable to load your Entrepreneur Network dashboard."
      );
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      }

      setLoading(false);
    }
  },
  []
);

  /*
   * Initial dashboard load.
   */
  useEffect(() => {
  let cancelled = false;

  const loadInitialDashboard = async () => {
    try {
      const data = await getEntrepreneurDashboard();

      if (cancelled) {
        return;
      }

      setDashboard(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      if (cancelled) {
        return;
      }

      console.error(
        "Failed to load entrepreneur dashboard:",
        err
      );

      setError(
        "Unable to load your Entrepreneur Network dashboard."
      );

      setLoading(false);
    }
  };

  void loadInitialDashboard();

  return () => {
    cancelled = true;
  };
}, []);
  /*
   * Near-real-time refresh.
   *
   * Refreshes every 10 seconds while the browser tab
   * is visible.
   */
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadDashboard(false);
      }
    }, 10_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadDashboard]);

  /*
   * Copy referral code.
   */
  const handleCopyCode = async () => {
    if (!dashboard?.referralCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        dashboard.referralCode
      );

      setCopiedCode(true);

      window.setTimeout(() => {
        setCopiedCode(false);
      }, 1500);
    } catch (err) {
      console.error(
        "Failed to copy referral code:",
        err
      );
    }
  };

  /*
   * Copy referral link.
   */
  const handleCopyLink = async () => {
    if (!dashboard?.referralLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        dashboard.referralLink
      );

      setCopiedLink(true);

      window.setTimeout(() => {
        setCopiedLink(false);
      }, 1500);
    } catch (err) {
      console.error(
        "Failed to copy referral link:",
        err
      );
    }
  };

  /*
   * Native share.
   *
   * If the browser doesn't support navigator.share,
   * fall back to copying the referral link.
   */
  const handleShare = async () => {
    if (!dashboard?.referralLink) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Alpha Entrepreneur Network",
          text:
            "Join the Alpha Entrepreneur Network using my referral link.",
          url: dashboard.referralLink,
        });
      } catch (err) {
        /*
         * AbortError normally means the user cancelled
         * the share dialog. We don't show an error.
         */
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Failed to share referral link:",
          err
        );
      }

      return;
    }

    await handleCopyLink();
  };

  /*
   * Initial loading state.
   */
  if (loading) {
    return (
      <RoleGuard
        allowedRoles={[
          "community_builder",
          "admin",
          "dispatcher",
        ]}
      >
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              <RefreshCw
                className="mx-auto animate-spin text-purple-600"
                size={28}
              />

              <p className="mt-4 font-semibold text-slate-700">
                Loading Entrepreneur Network...
              </p>
            </div>
          </div>
        </main>
      </RoleGuard>
    );
  }

  /*
   * Error state.
   */
  if (error && !dashboard) {
    return (
      <RoleGuard
        allowedRoles={[
          "community_builder",
          "admin",
          "dispatcher",
        ]}
      >
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <h1 className="text-xl font-bold text-red-700">
                Entrepreneur Dashboard
              </h1>

              <p className="mt-2 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadDashboard(true)}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </RoleGuard>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <RoleGuard
      allowedRoles={[
        "community_builder",
        "admin",
        "dispatcher",
      ]}
    >
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* =====================================================
              HEADER
          ====================================================== */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-purple-800 to-purple-600 text-white shadow-xl">

            <div className="p-6 sm:p-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-100">
                      Alpha Entrepreneur Network
                    </span>

                    {/* LIVE INDICATOR */}
                    <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-200">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                      </span>

                      Live
                    </span>
                  </div>

                  <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                    Build Your Network
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">
                    Refer eligible automotive partners and earn
                    rewards from qualifying completed transactions.
                  </p>
                </div>

                {/* REFRESH */}
                <button
                  type="button"
                  onClick={() => void loadDashboard(false)}
                  disabled={refreshing}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </button>

              </div>

              {/* =================================================
                  REFERRAL CODE
              ================================================== */}
              <div className="mt-8 rounded-2xl bg-white p-5 text-slate-900 shadow-lg sm:p-6">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Your Referral Code
                    </p>

                    {dashboard.referralCode ? (
                      <>
                        <p className="mt-2 break-all text-3xl font-black tracking-[0.2em] text-purple-700 sm:text-4xl">
                          {dashboard.referralCode}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          Share this code with people you refer
                          to Alpha.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 font-semibold text-red-600">
                        No referral code is available.
                      </p>
                    )}
                  </div>

                  {dashboard.referralCode && (
                    <button
                      type="button"
                      onClick={() => void handleCopyCode()}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-purple-800"
                    >
                      {copiedCode ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}

                      {copiedCode
                        ? "Copied"
                        : "Copy Code"}
                    </button>
                  )}

                </div>
              </div>

              {/* =================================================
                  REFERRAL LINK
              ================================================== */}
              {dashboard.referralLink && (
                <div className="mt-4 rounded-2xl bg-white p-3 text-slate-900 shadow-lg">

                  <div className="flex flex-col gap-3 lg:flex-row">

                    <input
                      type="text"
                      readOnly
                      value={dashboard.referralLink}
                      className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                      aria-label="Referral link"
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        onClick={() =>
                          void handleCopyLink()
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                      >
                        {copiedLink ? (
                          <Check size={18} />
                        ) : (
                          <Copy size={18} />
                        )}

                        {copiedLink
                          ? "Copied"
                          : "Copy Link"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleShare()
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
                      >
                        <Share2 size={18} />
                        Share
                      </button>

                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* AUTOMATIC REFRESH NOTICE */}
            <div className="border-t border-white/10 bg-black/10 px-6 py-3 text-xs text-purple-100 sm:px-8">
              Dashboard automatically refreshes every 10 seconds
              while this page is active.
            </div>

          </section>

          {/* =====================================================
              ERROR BANNER
          ====================================================== */}
          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}

              <button
                type="button"
                onClick={() => void loadDashboard(false)}
                className="ml-2 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* =====================================================
              SUMMARY CARDS
          ====================================================== */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryCard
              label="Direct Recruits"
              value={dashboard.directRecruits}
              icon={Users}
            />

            <SummaryCard
              label="Active Providers"
              value={dashboard.activeProviders}
              icon={UserCheck}
            />

            <SummaryCard
              label="Qualifying Transactions"
              value={dashboard.qualifyingTransactions}
              icon={ShoppingBag}
            />

            <SummaryCard
              label="Eligible Revenue"
              value={formatMoney(
                dashboard.eligibleNetPlatformRevenue,
                dashboard.currency
              )}
              icon={DollarSign}
            />

          </section>

          {/* =====================================================
              EARNINGS
          ====================================================== */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-900">
                Earnings
              </h2>

              <p className="text-sm text-slate-500">
                Your current Entrepreneur Network earnings.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <EarningsCard
                title="Pending Earnings"
                amount={dashboard.pendingEarnings}
                currency={dashboard.currency}
              />

              <EarningsCard
                title="Approved Earnings"
                amount={dashboard.approvedEarnings}
                currency={dashboard.currency}
              />

              <EarningsCard
                title="Paid Earnings"
                amount={dashboard.paidEarnings}
                currency={dashboard.currency}
              />

            </div>
          </section>

          {/* =====================================================
              PROGRAM INFORMATION
          ====================================================== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Entrepreneur Program
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current reward configuration
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 px-4 py-3 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-500">
                  Current Rate
                </p>

                <p className="mt-1 text-2xl font-black text-purple-700">
                  {formatPercentage(
                    dashboard.currentRate
                  )}
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">

              <InfoItem
                label="Network Level"
                value="Level 1"
              />

              <InfoItem
                label="Currency"
                value={dashboard.currency}
              />

              <InfoItem
                label="Next Payout"
                value={
                  dashboard.nextPayoutDate
                    ? new Date(
                        dashboard.nextPayoutDate
                      ).toLocaleDateString()
                    : "Not scheduled"
                }
              />

            </div>

          </section>

        </div>
      </main>
    </RoleGuard>
  );
}

/* =============================================================
   SUMMARY CARD
============================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
          <Icon size={22} />
        </div>

      </div>

    </div>
  );
}

/* =============================================================
   EARNINGS CARD
============================================================= */

function EarningsCard({
  title,
  amount,
  currency,
}: {
  title: string;
  amount: number;
  currency: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-slate-900">
        {formatMoney(amount, currency)}
      </p>

    </div>
  );
}

/* =============================================================
   INFO ITEM
============================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}