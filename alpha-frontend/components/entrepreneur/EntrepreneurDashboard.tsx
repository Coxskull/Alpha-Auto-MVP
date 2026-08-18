"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  Copy,
  Check,
  Share2,
  RefreshCw,
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
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export default function EntrepreneurDashboard() {
  const [dashboard, setDashboard] =
    useState<EntrepreneurDashboardType | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  async function loadDashboard() {
  try {
    setLoading(true);
    setError("");

    const result = await getEntrepreneurDashboard();

    setDashboard(result);
  } catch (error) {
    console.error(
      "Failed to load entrepreneur dashboard",
      error
    );

    setError(
      "Unable to load Entrepreneur Network dashboard."
    );
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  let cancelled = false;

  async function fetchDashboard() {
    try {
      const result = await getEntrepreneurDashboard();

      if (cancelled) return;

      setDashboard(result);
      setError("");
    } catch (error) {
      if (cancelled) return;

      console.error(
        "Failed to load entrepreneur dashboard",
        error
      );

      setError(
        "Unable to load Entrepreneur Network dashboard."
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchDashboard();

  return () => {
    cancelled = true;
  };
}, []);

  async function copyReferralLink() {
    if (!dashboard?.referralLink) {
      return;
    }

    await navigator.clipboard.writeText(
      dashboard.referralLink
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  async function shareReferralLink() {
    if (!dashboard?.referralLink) {
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: "Alpha Entrepreneur Network",
        text:
          "Join my Alpha Entrepreneur Network.",
        url: dashboard.referralLink,
      });

      return;
    }

    await copyReferralLink();
  }

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
          Loading Entrepreneur Network...
        </main>
      </RoleGuard>
    );
  }

  if (error || !dashboard) {
    return (
      <RoleGuard
        allowedRoles={[
          "community_builder",
          "admin",
          "dispatcher",
        ]}
      >
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        </main>
      </RoleGuard>
    );
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

          {/* HEADER */}

          <section className="rounded-3xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-6 text-white shadow-xl">

            <p className="text-sm font-bold uppercase tracking-wider text-purple-200">
              Alpha Entrepreneur Network
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Build Your Network
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Refer eligible automotive partners and earn
              rewards from qualifying completed transactions.
            </p>

            {dashboard.referralLink && (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-3 text-slate-900 sm:flex-row">

                <input
                  readOnly
                  value={dashboard.referralLink}
                  className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm"
                />

                <button
                  onClick={copyReferralLink}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
                >
                  {copied ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}

                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  onClick={shareReferralLink}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white"
                >
                  <Share2 size={18} />
                  Share
                </button>

              </div>
            )}
          </section>

          {/* SUMMARY */}

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

          {/* COMMISSION */}

          <section className="grid gap-4 sm:grid-cols-3">

            <MoneyCard
              title="Pending Earnings"
              amount={dashboard.pendingEarnings}
              currency={dashboard.currency}
            />

            <MoneyCard
              title="Approved Earnings"
              amount={dashboard.approvedEarnings}
              currency={dashboard.currency}
            />

            <MoneyCard
              title="Paid Earnings"
              amount={dashboard.paidEarnings}
              currency={dashboard.currency}
            />

          </section>

          {/* PROGRAM */}

          <section className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Entrepreneur Program
                </h2>

                <p className="text-sm text-slate-500">
                  Current reward configuration
                </p>
              </div>

              <button
                onClick={loadDashboard}
                className="rounded-lg border p-2 hover:bg-slate-50"
              >
                <RefreshCw size={18} />
              </button>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div>
                <p className="text-sm text-slate-500">
                  Current Rate
                </p>

                <p className="mt-1 text-2xl font-black">
                  {formatPercentage(
                    dashboard.currentRate
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Network Level
                </p>

                <p className="mt-1 text-2xl font-black">
                  Level 1
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Next Payout
                </p>

                <p className="mt-1 font-bold">
                  {dashboard.nextPayoutDate
                    ? new Date(
                        dashboard.nextPayoutDate
                      ).toLocaleDateString()
                    : "Not scheduled"}
                </p>
              </div>

            </div>

          </section>

        </div>
      </main>
    </RoleGuard>
  );
}

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
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black">
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

function MoneyCard({
  title,
  amount,
  currency,
}: {
  title: string;
  amount: number;
  currency: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <p className="text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black">
        {formatMoney(amount, currency)}
      </p>

    </div>
  );
}
