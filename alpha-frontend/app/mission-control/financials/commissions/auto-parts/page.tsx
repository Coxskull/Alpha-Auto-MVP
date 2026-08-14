"use client";

import { useEffect, useState } from "react";
import {
  getCurrentPolicy,
} from "./services/autoPartsCommissionService";

import {
  CommissionPolicy,
  CommissionTier,
} from "./types/autoPartsCommission";

export default function AutoPartsCommissionPage() {
  const [policy, setPolicy] = useState<CommissionPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPolicy = async () => {
      try {
        setError(null);

        const result = await getCurrentPolicy("USD");

        if (cancelled) return;

        setPolicy(result);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load commission policy:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load commission policy."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPolicy();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading commission policy...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Unable to load commission policy
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm text-gray-500">
          No active auto-parts commission policy found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Auto Parts Commission
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage progressive marketplace commission tiers.
        </p>
      </div>

      {/* POLICY SUMMARY */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {policy.policyName}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Currency: {policy.currency}
            </p>

            <p className="text-sm text-gray-500">
              Version {policy.version}
            </p>
          </div>

          <div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                policy.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {policy.isActive ? "Active" : "Inactive"}
            </span>
          </div>

        </div>

      </div>

      {/* COMMISSION TIERS */}
      <TierTable tiers={policy.tiers} />

    </div>
  );
}


/* =========================================================
   TIER TABLE
========================================================= */

function TierTable({
  tiers,
}: {
  tiers: CommissionTier[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="border-b px-6 py-4">
        <h2 className="font-semibold text-gray-900">
          Commission Tiers
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Progressive commission applied only to the auto-parts
          subtotal.
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-left text-xs font-medium uppercase text-gray-500">

              <th className="px-6 py-3">
                Tier
              </th>

              <th className="px-6 py-3">
                Minimum
              </th>

              <th className="px-6 py-3">
                Maximum
              </th>

              <th className="px-6 py-3">
                Commission
              </th>

              <th className="px-6 py-3">
                Status
              </th>

            </tr>

          </thead>

          <tbody className="divide-y">

            {tiers.map((tier) => (

              <tr
                key={tier.id ?? tier.tierOrder}
                className="text-sm"
              >

                <td className="px-6 py-4 font-medium">
                  Tier {tier.tierOrder}
                </td>

                <td className="px-6 py-4">
                  ${tier.minimumAmount.toFixed(2)}
                </td>

                <td className="px-6 py-4">

                  {tier.maximumAmount == null
                    ? "Above"
                    : `$${tier.maximumAmount.toFixed(2)}`}

                </td>

                <td className="px-6 py-4 font-semibold">
                  {tier.commissionPercentage}%
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      tier.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tier.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}