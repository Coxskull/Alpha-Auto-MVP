"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  getEntrepreneurReferrals,
} from "@/services/entrepreneurService";

import type {
  EntrepreneurReferral,
} from "@/types/entrepreneur";

export default function DirectNetworkPage() {
  const [referrals, setReferrals] =
    useState<EntrepreneurReferral[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadReferrals() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getEntrepreneurReferrals();

      setReferrals(result);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load your Entrepreneur Network."
      );
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadReferrals();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, []);
  const filtered = referrals.filter(
    (referral) => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return true;
      }

      return (
        referral.providerName
          ?.toLowerCase()
          .includes(value) ||
        referral.providerRole
          ?.toLowerCase()
          .includes(value) ||
        referral.referralCode
          ?.toLowerCase()
          .includes(value) ||
        referral.referralStatus
          ?.toLowerCase()
          .includes(value)
      );
    }
  );

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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-purple-600">
                Entrepreneur Network
              </p>

              <h1 className="mt-1 text-3xl font-black">
                My Direct Network
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                People directly recruited through your
                Entrepreneur referral link.
              </p>
            </div>

            <button
              onClick={loadReferrals}
              className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search your direct network..."
                className="w-full rounded-xl border py-3 pl-10 pr-4"
              />

            </div>

          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b p-5">
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                  <Users size={22} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Direct Recruits
                  </h2>

                  <p className="text-sm text-slate-500">
                    {filtered.length} direct recruit
                    {filtered.length === 1 ? "" : "s"}
                  </p>
                </div>

              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading network...
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">

                    <tr>
                      <th className="px-5 py-4">
                        Member
                      </th>

                      <th className="px-5 py-4">
                        Role
                      </th>

                      <th className="px-5 py-4">
                        Referral Status
                      </th>

                      <th className="px-5 py-4">
                        Activation
                      </th>

                      <th className="px-5 py-4">
                        Referral Date
                      </th>
                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {filtered.map(
                      (referral) => (
                        <tr
                          key={referral.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-5 py-4">

                            <p className="font-bold">
                              {referral.providerName ??
                                "Unknown member"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {referral.referralCode ??
                                "No referral code"}
                            </p>

                          </td>

                          <td className="px-5 py-4">
                            {referral.providerRole ??
                              "Unknown"}
                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              {referral.referralStatus ??
                                "Pending"}
                            </span>

                          </td>

                          <td className="px-5 py-4">
                            {referral.providerActivationDate
                              ? new Date(
                                  referral.providerActivationDate
                                ).toLocaleDateString()
                              : "Not activated"}
                          </td>

                          <td className="px-5 py-4">
                            {referral.referralDate
                              ? new Date(
                                  referral.referralDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

                {!filtered.length && (
                  <div className="p-10 text-center text-slate-500">
                    No direct referrals found.
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </main>
    </RoleGuard>
  );
}