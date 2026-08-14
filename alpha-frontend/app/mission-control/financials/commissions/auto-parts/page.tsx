"use client";

import { useEffect, useState } from "react";

import {
  getCurrentPolicy,
  updateTier,
} from "./services/autoPartsCommissionService";

import type {
  CommissionPolicy,
  CommissionTier,
} from "./types/autoPartsCommission";

const CURRENCY = "USD";

export default function AutoPartsCommissionPage() {
  const [policy, setPolicy] =
    useState<CommissionPolicy | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [editingTier, setEditingTier] =
    useState<CommissionTier | null>(null);

  const [showTierEditor, setShowTierEditor] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  /**
   * Load the current commission policy.
   */
  async function loadPolicy() {
    try {
      setError(null);

      const result =
        await getCurrentPolicy(CURRENCY);

      setPolicy(result);
    } catch (err) {
      console.error(
        "Failed to load commission policy:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load commission policy."
      );
    }
  }

  /**
   * Initial page load.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchPolicy() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getCurrentPolicy(CURRENCY);

        if (cancelled) return;

        setPolicy(result);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to load commission policy:",
          err
        );

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
    }

    fetchPolicy();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Open editor for an existing tier.
   */
  function handleEditTier(
    tier: CommissionTier
  ) {
    setEditingTier(tier);
    setShowTierEditor(true);
  }

  /**
   * Close editor.
   */
  function handleCloseEditor() {
    if (saving) return;

    setShowTierEditor(false);
    setEditingTier(null);
  }

  /**
   * Save an existing tier.
   */
  async function handleSaveTier(
    tier: CommissionTier
  ) {
    if (!tier.id) {
      alert(
        "This tier does not have an ID and cannot be updated."
      );

      return;
    }

    try {
      setSaving(true);

      await updateTier(tier.id, {
        minimum: tier.minimumAmount,
        maximum: tier.maximumAmount,
        commissionRate:
          tier.commissionPercentage,
        isActive: tier.isActive,
      });

      setShowTierEditor(false);
      setEditingTier(null);

      await loadPolicy();
    } catch (err) {
      console.error(
        "Failed to save commission tier:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to save commission tier."
      );
    } finally {
      setSaving(false);
    }
  }

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

        <button
          type="button"
          onClick={loadPolicy}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">
          No active auto-parts commission policy found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6">

        {/* PAGE HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Auto Parts Commission
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage progressive marketplace commission tiers.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPolicy}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
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

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                policy.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {policy.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </div>
        </div>

        {/* COMMISSION TIERS */}
        <TierTable
          tiers={policy.tiers}
          onEdit={handleEditTier}
        />
      </div>

      {/* EDIT MODAL */}
      {showTierEditor && editingTier && (
        <TierEditor
          tier={editingTier}
          saving={saving}
          onCancel={handleCloseEditor}
          onSave={handleSaveTier}
        />
      )}
    </>
  );
}


/* =========================================================
   TIER TABLE
========================================================= */

function TierTable({
  tiers,
  onEdit,
}: {
  tiers: CommissionTier[];
  onEdit: (tier: CommissionTier) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-gray-900">
              Commission Tiers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Progressive commission applied only to the
              auto-parts subtotal.
            </p>
          </div>

        </div>
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

              <th className="px-6 py-3 text-right">
                Action
              </th>

            </tr>

          </thead>

          <tbody className="divide-y">

            {tiers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No commission tiers found.
                </td>
              </tr>
            ) : (
              tiers.map((tier) => (

                <tr
                  key={
                    tier.id ??
                    tier.tierOrder
                  }
                  className="text-sm hover:bg-gray-50"
                >

                  {/* TIER */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Tier {tier.tierOrder}
                  </td>

                  {/* MINIMUM */}
                  <td className="px-6 py-4 text-gray-700">
                    {formatCurrency(
                      tier.minimumAmount
                    )}
                  </td>

                  {/* MAXIMUM */}
                  <td className="px-6 py-4 text-gray-700">
                    {tier.maximumAmount == null
                      ? "Above"
                      : formatCurrency(
                          tier.maximumAmount
                        )}
                  </td>

                  {/* COMMISSION */}
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {tier.commissionPercentage}%
                  </td>

                  {/* STATUS */}
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

                  {/* ACTION */}
                  <td className="px-6 py-4 text-right">

                    <button
                      type="button"
                      onClick={() =>
                        onEdit(tier)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


/* =========================================================
   TIER EDITOR
========================================================= */

function TierEditor({
  tier,
  saving,
  onCancel,
  onSave,
}: {
  tier: CommissionTier;
  saving: boolean;
  onCancel: () => void;
  onSave: (tier: CommissionTier) => void;
}) {
  const [form, setForm] =
    useState<CommissionTier>(tier);

  const [isAbove, setIsAbove] =
    useState(tier.maximumAmount == null);

  function updateForm(
    changes: Partial<CommissionTier>
  ) {
    setForm((current) => ({
      ...current,
      ...changes,
    }));
  }

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      !Number.isFinite(
        form.minimumAmount
      ) ||
      form.minimumAmount < 0
    ) {
      alert(
        "Minimum amount must be 0 or greater."
      );

      return;
    }

    if (
      !Number.isFinite(
        form.commissionPercentage
      ) ||
      form.commissionPercentage < 0 ||
      form.commissionPercentage > 100
    ) {
      alert(
        "Commission percentage must be between 0 and 100."
      );

      return;
    }

    if (!isAbove) {
      if (
        form.maximumAmount == null ||
        !Number.isFinite(
          form.maximumAmount
        )
      ) {
        alert(
          "Please enter a maximum amount."
        );

        return;
      }

      if (
        form.maximumAmount <=
        form.minimumAmount
      ) {
        alert(
          "Maximum amount must be greater than minimum amount."
        );

        return;
      }
    }

    onSave({
      ...form,
      maximumAmount: isAbove
        ? null
        : form.maximumAmount,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* MODAL HEADER */}
        <div className="border-b px-6 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Tier {tier.tierOrder}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the commission rules for this tier.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="text-xl text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ×
            </button>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* MINIMUM */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Minimum Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minimumAmount}
              onChange={(event) =>
                updateForm({
                  minimumAmount:
                    Number(
                      event.target.value
                    ),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* MAXIMUM */}
          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Maximum Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              disabled={isAbove}
              value={
                isAbove
                  ? ""
                  : form.maximumAmount ?? ""
              }
              onChange={(event) =>
                updateForm({
                  maximumAmount:
                    event.target.value === ""
                      ? null
                      : Number(
                          event.target.value
                        ),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none disabled:bg-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              placeholder={
                isAbove
                  ? "No maximum"
                  : "Enter maximum"
              }
            />

            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">

              <input
                type="checkbox"
                checked={isAbove}
                onChange={(event) =>
                  setIsAbove(
                    event.target.checked
                  )
                }
              />

              No maximum — Above this amount
            </label>

          </div>

          {/* COMMISSION */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Commission Percentage
            </label>

            <div className="relative">

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  form.commissionPercentage
                }
                onChange={(event) =>
                  updateForm({
                    commissionPercentage:
                      Number(
                        event.target.value
                      ),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <span className="absolute right-3 top-2 text-gray-500">
                %
              </span>

            </div>
          </div>

          {/* STATUS */}
          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={
                form.isActive
                  ? "active"
                  : "inactive"
              }
              onChange={(event) =>
                updateForm({
                  isActive:
                    event.target.value ===
                    "active",
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}