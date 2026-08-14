"use client";

import { useState } from "react";

import {
  CommissionCalculationResult,
} from "../types/autoPartsCommission";

import {
  calculateCommission,
} from "../services/autoPartsCommissionService";

interface CommissionPreviewProps {
  currency: string;
}

export default function CommissionPreview({
  currency,
}: CommissionPreviewProps) {

  const [subtotal, setSubtotal] = useState<string>("300");

  const [result, setResult] =
    useState<CommissionCalculationResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleCalculate() {

    const amount = Number(subtotal);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    try {

      setLoading(true);
      setError(null);

      const calculation =
        await calculateCommission(
          amount,
          currency
        );

      setResult(calculation);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate commission."
      );

    } finally {

      setLoading(false);

    }
  }

  function formatMoney(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h2 className="text-lg font-semibold text-gray-900">
          Commission Calculator
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Preview how the progressive commission applies
          before changing a policy.
        </p>

      </div>

      <div className="flex flex-col gap-3 sm:flex-row">

        <div className="flex-1">

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Parts Subtotal
          </label>

          <div className="relative">

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {currency}
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={subtotal}
              onChange={(e) =>
                setSubtotal(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 pl-14 outline-none focus:border-black"
              placeholder="300.00"
            />

          </div>

        </div>

        <div className="flex items-end">

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Calculating..."
              : "Calculate"}
          </button>

        </div>

      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (

        <div className="mt-6 space-y-5">

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-lg bg-gray-50 p-4">

              <div className="text-sm text-gray-500">
                Parts Subtotal
              </div>

              <div className="mt-1 text-xl font-bold">
                {formatMoney(
                  result.partsSubtotal
                )}
              </div>

            </div>

            <div className="rounded-lg bg-gray-50 p-4">

              <div className="text-sm text-gray-500">
                Alpha Commission
              </div>

              <div className="mt-1 text-xl font-bold">
                {formatMoney(
                  result.totalCommission
                )}
              </div>

            </div>

            <div className="rounded-lg bg-gray-50 p-4">

              <div className="text-sm text-gray-500">
                Effective Rate
              </div>

              <div className="mt-1 text-xl font-bold">
                {result.effectiveCommissionRate.toFixed(
                  2
                )}
                %
              </div>

            </div>

          </div>

          <div>

            <h3 className="mb-3 font-semibold">
              Calculation Breakdown
            </h3>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px]">

                <thead className="border-b bg-gray-50">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs uppercase">
                      Tier
                    </th>

                    <th className="px-4 py-3 text-right text-xs uppercase">
                      Amount
                    </th>

                    <th className="px-4 py-3 text-right text-xs uppercase">
                      Rate
                    </th>

                    <th className="px-4 py-3 text-right text-xs uppercase">
                      Commission
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {result.lines.map((line) => (

                    <tr key={line.tierId}>

                      <td className="px-4 py-3">
                        Tier {line.tierOrder}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatMoney(
                          line.amountInTier
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {line.tierPercentage.toFixed(2)}%
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatMoney(
                          line.commissionAmount
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}