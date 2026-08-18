"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";

import {
  getEntrepreneurEarnings,
} from "@/services/entrepreneurService";

import type {
  EntrepreneurEarning,
} from "@/types/entrepreneur";

function money(
  value: number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export default function EntrepreneurEarningsPage() {
  const [earnings, setEarnings] =
    useState<EntrepreneurEarning[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const result =
          await getEntrepreneurEarnings();

        setEarnings(result);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load Entrepreneur earnings."
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <RoleGuard
      allowedRoles={[
        "community_builder",
        "admin",
        "dispatcher",
      ]}
    >
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

        <div className="mx-auto max-w-7xl">

          <h1 className="text-3xl font-black">
            Entrepreneur Earnings
          </h1>

          <p className="mt-2 text-slate-500">
            Earnings generated from eligible transactions
            involving your direct network.
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto rounded-2xl border bg-white shadow-sm">

            {loading ? (
              <div className="p-8 text-center">
                Loading earnings...
              </div>
            ) : (
              <table className="min-w-full">

                <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">

                  <tr>
                    <th className="px-5 py-4">
                      Transaction
                    </th>

                    <th className="px-5 py-4">
                      Provider
                    </th>

                    <th className="px-5 py-4">
                      Eligible Revenue
                    </th>

                    <th className="px-5 py-4">
                      Rate
                    </th>

                    <th className="px-5 py-4">
                      Entrepreneur Earnings
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y">

                  {earnings.map(
                    (earning) => (
                      <tr
                        key={earning.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">
                          <p className="font-bold">
                            {earning.transactionId}
                          </p>

                          <p className="text-xs text-slate-500">
                            Order: {earning.orderId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {earning.providerRole}
                        </td>

                        <td className="px-5 py-4">
                          {money(
                            earning.eligibleNetPlatformRevenue,
                            earning.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {(earning.entrepreneurPercentage * 100).toFixed(2)}%
                        </td>

                        <td className="px-5 py-4 font-black text-emerald-700">
                          {money(
                            earning.entrepreneurEarningsAmount,
                            earning.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            {earning.earningStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {new Date(
                            earning.transactionDate
                          ).toLocaleDateString()}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>
            )}

            {!loading && earnings.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                No Entrepreneur earnings yet.
              </div>
            )}

          </div>

        </div>

      </main>
    </RoleGuard>
  );
}