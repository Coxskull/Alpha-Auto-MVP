"use client";

import { CommissionTier } from "../types/autoPartsCommission";

interface CommissionTierTableProps {
  tiers: CommissionTier[];
  currency: string;
}

function formatAmount(
  amount: number,
  currency: string
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function CommissionTierTable({
  tiers,
  currency,
}: CommissionTierTableProps) {

  const sortedTiers = [...tiers].sort(
    (a, b) => a.tierOrder - b.tierOrder
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="border-b p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Progressive Commission Tiers
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Commission is calculated progressively across each
          price bracket.
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[700px]">

          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Tier
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Minimum
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Maximum
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Rate
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {sortedTiers.map((tier) => (

              <tr
                key={tier.id}
                className="hover:bg-gray-50"
              >

                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    Tier {tier.tierOrder}
                  </div>
                </td>

                <td className="px-6 py-4 text-right text-gray-700">
                  {formatAmount(
                    tier.minimumAmount,
                    currency
                  )}
                </td>

                <td className="px-6 py-4 text-right text-gray-700">
                  {tier.maximumAmount === null
                    ? "Above"
                    : formatAmount(
                        tier.maximumAmount,
                        currency
                      )}
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">
                    {tier.commissionPercentage.toFixed(2)}%
                  </span>
                </td>

                <td className="px-6 py-4 text-center">

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      tier.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
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