"use client";

import { useState, type FormEvent } from "react";
import type { CommissionTier } from "../types/autoPartsCommission";

interface TierEditorProps {
  tier: CommissionTier | null;
  onSave: (tier: CommissionTier) => Promise<void>;
  onCancel: () => void;
}

export default function TierEditor({
  tier,
  onSave,
  onCancel,
}: TierEditorProps) {
  const [minimum, setMinimum] = useState(
    tier?.minimumAmount != null
      ? String(tier.minimumAmount)
      : ""
  );

  const [maximum, setMaximum] = useState(
    tier?.maximumAmount != null
      ? String(tier.maximumAmount)
      : ""
  );

  const [rate, setRate] = useState(
    tier?.commissionPercentage != null
      ? String(tier.commissionPercentage)
      : ""
  );

  const [isActive, setIsActive] = useState(
    tier?.isActive ?? true
  );

  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const minimumValue = Number(minimum);

    const maximumValue =
      maximum.trim() === ""
        ? null
        : Number(maximum);

    const rateValue = Number(rate);

    // -----------------------------------------
    // VALIDATE MINIMUM
    // -----------------------------------------

    if (
      !Number.isFinite(minimumValue) ||
      minimumValue < 0
    ) {
      alert(
        "Minimum amount is required and cannot be negative."
      );
      return;
    }

    // -----------------------------------------
    // VALIDATE MAXIMUM
    // -----------------------------------------

    if (
      maximumValue !== null &&
      (
        !Number.isFinite(maximumValue) ||
        maximumValue <= minimumValue
      )
    ) {
      alert(
        "Maximum amount must be greater than minimum amount."
      );
      return;
    }

    // -----------------------------------------
    // VALIDATE COMMISSION RATE
    // -----------------------------------------

    if (
      !Number.isFinite(rateValue) ||
      rateValue < 0 ||
      rateValue > 100
    ) {
      alert(
        "Commission rate must be between 0% and 100%."
      );
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...(tier ?? {}),

        minimumAmount: minimumValue,

        maximumAmount: maximumValue,

        commissionPercentage: rateValue,

        isActive,
      } as CommissionTier);
    } catch (error) {
      console.error(
        "Failed to save commission tier:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save commission tier."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {tier
              ? "Edit Commission Tier"
              : "Add Commission Tier"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure the progressive commission range.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* MINIMUM */}
          <div>
            <label
              htmlFor="tier-minimum"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Minimum
            </label>

            <input
              id="tier-minimum"
              type="number"
              min="0"
              step="0.01"
              value={minimum}
              onChange={(e) =>
                setMinimum(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {/* MAXIMUM */}
          <div>
            <label
              htmlFor="tier-maximum"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Maximum
            </label>

            <input
              id="tier-maximum"
              type="number"
              min="0"
              step="0.01"
              value={maximum}
              onChange={(e) =>
                setMaximum(e.target.value)
              }
              placeholder="Leave empty for unlimited"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Leave empty for the final Above tier.
            </p>
          </div>

          {/* COMMISSION RATE */}
          <div>
            <label
              htmlFor="tier-rate"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Commission Rate (%)
            </label>

            <input
              id="tier-rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={rate}
              onChange={(e) =>
                setRate(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              required
            />

            <p className="mt-1 text-xs text-gray-500">
              Enter a percentage from 0% to 100%.
            </p>
          </div>

          {/* ACTIVE */}
          <div className="flex items-center gap-3">
            <input
              id="tier-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <label
              htmlFor="tier-active"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t pt-4">

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : tier
                  ? "Update Tier"
                  : "Save Tier"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}