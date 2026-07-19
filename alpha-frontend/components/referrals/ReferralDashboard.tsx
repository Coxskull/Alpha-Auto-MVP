"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  DollarSign,
  Network,
  RefreshCw,
  Share2,
  UserCheck,
  Users,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  getReferralDashboard,
  type ReferralDashboard,
  type ReferralMember,
} from "@/services/referrals";

function formatMoney(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    customer: "Customer",
    driver: "Driver",
    supplier: "Supplier",
    provider: "Provider",
    mechanic: "Mechanic",
    admin: "Admin",
    dispatcher: "Dispatcher",
  };

  return labels[role.toLowerCase()] ?? role;
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const classes =
    normalized === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "available"
      ? "bg-blue-100 text-blue-700"
      : normalized === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

export default function ReferralPage() {
  const [dashboard, setDashboard] =
    useState<ReferralDashboard | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedLevel, setSelectedLevel] =
    useState<number | "all">("all");

  async function refreshDashboard() {
  try {
    setLoading(true);
    setError("");

    const result = await getReferralDashboard();

    setDashboard(result);
  } catch (error) {
    console.error(
      "Failed to load referral dashboard:",
      error
    );

    setError(
      "The referral dashboard could not be loaded."
    );
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  let isCancelled = false;

  async function fetchInitialDashboard() {
    try {
      const result = await getReferralDashboard();

      if (isCancelled) {
        return;
      }

      setDashboard(result);
      setError("");
    } catch (error) {
      console.error(
        "Failed to load referral dashboard:",
        error
      );

      if (isCancelled) {
        return;
      }

      setError(
        "The referral dashboard could not be loaded."
      );
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }
  }

  void fetchInitialDashboard();

  return () => {
    isCancelled = true;
  };
}, []);

  const filteredMembers = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const normalizedSearch =
      search.trim().toLowerCase();

    return dashboard.networkMembers.filter(
      (member: ReferralMember) => {
        const matchesSearch =
          !normalizedSearch ||
          member.fullName
            .toLowerCase()
            .includes(normalizedSearch) ||
          member.role
            .toLowerCase()
            .includes(normalizedSearch) ||
          member.referralCode
            ?.toLowerCase()
            .includes(normalizedSearch);

        const matchesLevel =
          selectedLevel === "all" ||
          member.level === selectedLevel;

        return matchesSearch && matchesLevel;
      }
    );
  }, [dashboard, search, selectedLevel]);

  async function copyReferralLink() {
    if (!dashboard) {
      return;
    }

    await navigator.clipboard.writeText(
      dashboard.referralLink
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  async function shareReferralLink() {
    if (!dashboard) {
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: "Join Alpha",
        text: "Join my Alpha network using this referral link.",
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
          "customer",
          "driver",
          "supplier",
          "provider",
          "mechanic",
          "admin",
          "dispatcher",
          "tow_provider",
        ]}
      >
        <main className="min-h-screen bg-[#f5f6fa] p-6">
          <div className="mx-auto max-w-7xl">
            Loading referral dashboard...
          </div>
        </main>
      </RoleGuard>
    );
  }

  if (error || !dashboard) {
    return (
      <RoleGuard
        allowedRoles={[
          "customer",
          "driver",
          "supplier",
          "provider",
          "mechanic",
          "admin",
          "dispatcher",
          "tow_provider",
        ]}
      >
        <main className="min-h-screen bg-[#f5f6fa] p-6">
          <div className="mx-auto max-w-7xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <p className="font-semibold">{error}</p>

            <button
              type="button"
              onClick={refreshDashboard}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        </main>
      </RoleGuard>
    );
  }

  const { summary } = dashboard;

  return (
    <RoleGuard
      allowedRoles={[
        "customer",
        "driver",
        "supplier",
        "provider",
        "mechanic",
        "admin",
        "dispatcher",
        "tow_provider",
      ]}
    >
      <main className="min-h-screen bg-[#f5f6fa] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#351080] via-[#5720b2] to-[#7c3fe0] p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-200">
                  Alpha Referral Network
                </p>

                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Grow your Alpha network
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">
                  Invite customers and automotive partners,
                  monitor their activity, and see referral
                  earnings from eligible Alpha transactions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Your referral code
                </p>

                <p className="mt-2 text-2xl font-black tracking-wide">
                  {dashboard.referralCode}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-3 text-slate-900 sm:flex-row">
              <input
                readOnly
                value={dashboard.referralLink}
                className="h-12 min-w-0 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none"
              />

              <button
                type="button"
                onClick={copyReferralLink}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"
              >
                {copied ? (
                  <Check size={18} />
                ) : (
                  <Copy size={18} />
                )}

                {copied ? "Copied" : "Copy"}
              </button>

              <button
                type="button"
                onClick={shareReferralLink}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6425c4] px-5 text-sm font-bold text-white"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Direct members"
              value={summary.directMembers.toString()}
              icon={Users}
            />

            <SummaryCard
              label="Total network"
              value={summary.totalNetworkMembers.toString()}
              icon={Network}
            />

            <SummaryCard
              label="Active members"
              value={summary.activeNetworkMembers.toString()}
              icon={UserCheck}
            />

            <SummaryCard
              label="Lifetime referral earnings"
              value={formatMoney(
                summary.lifetimeEarnings,
                summary.currency
              )}
              icon={DollarSign}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <EarningCard
              label="Pending"
              value={formatMoney(
                summary.pendingEarnings,
                summary.currency
              )}
            />

            <EarningCard
              label="Available"
              value={formatMoney(
                summary.availableEarnings,
                summary.currency
              )}
            />

            <EarningCard
              label="Paid"
              value={formatMoney(
                summary.paidEarnings,
                summary.currency
              )}
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  My network
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  People who joined Alpha through your referral tree.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshDashboard}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="grid gap-3 border-b border-slate-200 p-5 sm:grid-cols-[1fr_auto]">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, role, or code..."
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />

              <select
                value={selectedLevel}
                onChange={(event) =>
                  setSelectedLevel(
                    event.target.value === "all"
                      ? "all"
                      : Number(event.target.value)
                  )
                }
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none"
              >
                <option value="all">All levels</option>
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Member</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Level</th>
                    <th className="px-5 py-4">Sponsor</th>
                    <th className="px-5 py-4">Transactions</th>
                    <th className="px-5 py-4">Volume</th>
                    <th className="px-5 py-4">Commission</th>
                    <th className="px-5 py-4">Joined</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.userId}
                      className="text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">
                          {member.fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {member.referralCode ?? "No code"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {roleLabel(member.role)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                          Level {member.level}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {member.referredByName ?? "You"}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {member.transactionCount}
                      </td>

                      <td className="px-5 py-4">
                        {formatMoney(
                          member.generatedVolume,
                          summary.currency
                        )}
                      </td>

                      <td className="px-5 py-4 font-bold text-emerald-700">
                        {formatMoney(
                          member.generatedCommission,
                          summary.currency
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {formatDate(member.joinedAt)}
                      </td>
                    </tr>
                  ))}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No referral members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-950">
                Network transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Eligible transactions generated by members in your network.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Member</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Level</th>
                    <th className="px-5 py-4">Volume</th>
                    <th className="px-5 py-4">Rate</th>
                    <th className="px-5 py-4">Commission</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {dashboard.recentTransactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="text-sm text-slate-700"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-950">
                            {transaction.sourceUserName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {roleLabel(
                              transaction.sourceRole
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {transaction.transactionType}
                        </td>

                        <td className="px-5 py-4">
                          Level {transaction.referralLevel}
                        </td>

                        <td className="px-5 py-4">
                          {formatMoney(
                            transaction.grossAmount,
                            transaction.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {(
                            transaction.commissionRate * 100
                          ).toFixed(2)}
                          %
                        </td>

                        <td className="px-5 py-4 font-bold text-emerald-700">
                          {formatMoney(
                            transaction.commissionAmount,
                            transaction.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={transaction.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          {formatDate(
                            transaction.createdAt
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {dashboard.recentTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No referral transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}

type IconType =
  React.ComponentType<{
    size?: number;
    className?: string;
  }>;

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: IconType;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-black text-slate-950">
            {value}
          </p>
        </div>

        <span className="grid h-11 w-11 place-items-center rounded-xl bg-purple-100 text-purple-700">
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function EarningCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label} earnings
      </p>

      <p className="mt-2 text-2xl font-black text-slate-950">
        {value}
      </p>
    </article>
  );
}