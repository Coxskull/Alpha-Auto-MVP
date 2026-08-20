"use client";

import { useEffect, useState } from "react";

import {
  getCurrentPolicy,
  updateTier,
  createTier,
  deleteTier,
} from "./services/autoPartsCommissionService";

import type {
  CommissionPolicy,
  CommissionTier,
} from "./types/autoPartsCommission";

/* =============================================================
   CONFIGURATION
============================================================= */

/**
 * Currency used by the Auto Parts Commission policy.
 *
 * Change this to "PHP", "MXN", or "USD" if your backend policy
 * uses a different currency.
 */
const CURRENCY = "USD" as const;


/* =============================================================
   PAGE
============================================================= */

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


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
  let cancelled = false;

  getCurrentPolicy(CURRENCY)
    .then((result) => {
      if (cancelled) return;

      setPolicy(result);
      setError(null);
    })
    .catch((err: unknown) => {
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
    })
    .finally(() => {
      if (cancelled) return;

      setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);

  /* ============================================================
     LOAD POLICY
  ============================================================ */

  async function loadPolicy() {
    try {
      setError(null);

      const result =
        await getCurrentPolicy(CURRENCY);

      setPolicy(result);
    } catch (err: unknown) {
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


  /* ============================================================
     ADD TIER
  ============================================================ */

  function handleAddTier() {
    if (!policy) {
      alert("Commission policy is not loaded.");
      return;
    }

    const tiers = [...policy.tiers].sort(
      (a, b) => a.tierOrder - b.tierOrder
    );

    const nextTierOrder =
      tiers.length > 0
        ? Math.max(
            ...tiers.map(
              (tier) => tier.tierOrder
            )
          ) + 1
        : 1;

    const lastTier =
      tiers.length > 0
        ? tiers[tiers.length - 1]
        : null;

    /*
     * If the last tier is unlimited, another tier
     * cannot be inserted after it.
     */
    if (
      lastTier &&
      lastTier.maximumAmount == null
    ) {
      alert(
        "The current final tier has no maximum amount. Edit that tier and give it a maximum amount before adding another tier."
      );

      return;
    }

    const newTier: CommissionTier = {
      id: "",

      tierOrder: nextTierOrder,

      minimumAmount:
        lastTier?.maximumAmount ?? 0,

      maximumAmount: null,

      commissionPercentage: 0,

      isActive: true,
    };

    setEditingTier(newTier);
    setShowTierEditor(true);
  }


  /* ============================================================
     EDIT TIER
  ============================================================ */

  function handleEditTier(
    tier: CommissionTier
  ) {
    setEditingTier({
      ...tier,
    });

    setShowTierEditor(true);
  }


  /* ============================================================
     DELETE / DEACTIVATE TIER
  ============================================================ */

  async function handleDeleteTier(
    tier: CommissionTier
  ) {
    if (!tier.id) {
      alert(
        "This tier has not been saved yet."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to deactivate Tier ${tier.tierOrder}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await deleteTier(tier.id);

      await loadPolicy();
    } catch (err: unknown) {
      console.error(
        "Failed to delete commission tier:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete commission tier."
      );
    } finally {
      setSaving(false);
    }
  }


  /* ============================================================
     CLOSE EDITOR
  ============================================================ */

  function handleCloseEditor() {
    if (saving) {
      return;
    }

    setShowTierEditor(false);
    setEditingTier(null);
  }


  /* ============================================================
     SAVE TIER
  ============================================================ */

  async function handleSaveTier(
    tier: CommissionTier
  ) {
    if (!policy) {
      alert(
        "Commission policy is not loaded."
      );

      return;
    }

    try {
      setSaving(true);

      /* ========================================================
         UPDATE EXISTING TIER
      ======================================================== */

      if (tier.id) {
        await updateTier(tier.id, {
          minimumAmount:
            tier.minimumAmount,

          maximumAmount:
            tier.maximumAmount,

          commissionPercentage:
            tier.commissionPercentage,

          isActive:
            tier.isActive,
        });
      }

      /* ========================================================
         CREATE NEW TIER
      ======================================================== */

      else {
        await createTier(policy.id, {
          minimumAmount:
            tier.minimumAmount,

          maximumAmount:
            tier.maximumAmount,

          commissionPercentage:
            tier.commissionPercentage,

          isActive:
            tier.isActive,
        });
      }

      setShowTierEditor(false);
      setEditingTier(null);

      await loadPolicy();
    } catch (err: unknown) {
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


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading commission policy...
        </div>
      </div>
    );
  }


  /* ============================================================
     ERROR
  ============================================================ */

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
          onClick={() => {
            void loadPolicy();
          }}
          disabled={saving}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Retry
        </button>
      </div>
    );
  }


  /* ============================================================
     NO POLICY
  ============================================================ */

  if (!policy) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">
          No active auto-parts commission policy found.
        </p>
      </div>
    );
  }


  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <>
      <div className="space-y-6 p-6">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

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
            onClick={() => {
              void loadPolicy();
            }}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>

        </div>


        {/* ======================================================
            POLICY SUMMARY
        ====================================================== */}

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


        {/* ======================================================
            COMMISSION TIERS
        ====================================================== */}

        <TierTable
          tiers={policy.tiers}
          onAdd={handleAddTier}
          onEdit={handleEditTier}
          onDelete={handleDeleteTier}
          saving={saving}
        />

      </div>


      {/* ========================================================
          TIER EDITOR MODAL
      ======================================================== */}

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


/* =============================================================
   TIER TABLE
============================================================= */

function TierTable({
  tiers,
  onAdd,
  onEdit,
  onDelete,
  saving,
}: {
  tiers: CommissionTier[];
  onAdd: () => void;
  onEdit: (
    tier: CommissionTier
  ) => void;
  onDelete: (
    tier: CommissionTier
  ) => void;
  saving: boolean;
}) {
  const sortedTiers = [...tiers].sort(
    (a, b) =>
      a.tierOrder - b.tierOrder
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* ========================================================
          TABLE HEADER
      ======================================================== */}

      <div className="border-b px-6 py-4">

        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="font-semibold text-gray-900">
              Commission Tiers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Progressive commission applied only to
              the auto-parts subtotal.
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={saving}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Tier
          </button>

        </div>

      </div>


      {/* ========================================================
          TABLE
      ======================================================== */}

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
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y">

            {sortedTiers.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No commission tiers found.
                </td>

              </tr>

            ) : (

              sortedTiers.map((tier) => (

                <tr
                  key={
                    tier.id ||
                    `new-${tier.tierOrder}`
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


                  {/* ACTIONS */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          onEdit(tier)
                        }
                        disabled={saving}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>


                      {/* DELETE */}

                      {tier.isActive && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(tier)
                          }
                          disabled={saving}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}

                    </div>

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


/* =============================================================
   TIER EDITOR
============================================================= */

function TierEditor({
  tier,
  saving,
  onCancel,
  onSave,
}: {
  tier: CommissionTier;
  saving: boolean;
  onCancel: () => void;
  onSave: (
    tier: CommissionTier
  ) => void;
}) {
  const [form, setForm] =
    useState<CommissionTier>({
      ...tier,
    });

  const [isAbove, setIsAbove] =
    useState(
      tier.maximumAmount == null
    );


  /* ============================================================
     UPDATE FORM
  ============================================================ */

  function updateForm(
    changes: Partial<CommissionTier>
  ) {
    setForm((current) => ({
      ...current,
      ...changes,
    }));
  }


  /* ============================================================
     SUBMIT
  ============================================================ */

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    /* ----------------------------------------------------------
       MINIMUM
    ---------------------------------------------------------- */

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


    /* ----------------------------------------------------------
       COMMISSION
    ---------------------------------------------------------- */

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


    /* ----------------------------------------------------------
       MAXIMUM
    ---------------------------------------------------------- */

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


    /* ----------------------------------------------------------
       SAVE
    ---------------------------------------------------------- */

    onSave({
      ...form,

      maximumAmount:
        isAbove
          ? null
          : form.maximumAmount,
    });
  }


  const isNewTier =
    !tier.id;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b px-6 py-4">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">

                {isNewTier
                  ? `Add Tier ${tier.tierOrder}`
                  : `Edit Tier ${tier.tierOrder}`}

              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure the commission rules for this tier.
              </p>

            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="text-2xl leading-none text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Close"
            >
              ×
            </button>

          </div>

        </div>


        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* ==================================================
              MINIMUM
          ================================================== */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Minimum Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                Number.isFinite(
                  form.minimumAmount
                )
                  ? form.minimumAmount
                  : ""
              }
              onChange={(event) =>
                updateForm({
                  minimumAmount:
                    event.target.value === ""
                      ? 0
                      : Number(
                          event.target.value
                        ),
                })
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
            />

          </div>


          {/* ==================================================
              MAXIMUM
          ================================================== */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Maximum Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              disabled={
                saving ||
                isAbove
              }
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
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
                disabled={saving}
                onChange={(event) =>
                  setIsAbove(
                    event.target.checked
                  )
                }
              />

              No maximum — Above this amount

            </label>

          </div>


          {/* ==================================================
              COMMISSION
          ================================================== */}

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
                  Number.isFinite(
                    form.commissionPercentage
                  )
                    ? form.commissionPercentage
                    : ""
                }
                onChange={(event) =>
                  updateForm({
                    commissionPercentage:
                      event.target.value === ""
                        ? 0
                        : Number(
                            event.target.value
                          ),
                  })
                }
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
              />

              <span className="absolute right-3 top-2 text-gray-500">
                %
              </span>

            </div>

          </div>


          {/* ==================================================
              STATUS
          ================================================== */}

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
              disabled={saving}
              onChange={(event) =>
                updateForm({
                  isActive:
                    event.target.value ===
                    "active",
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex justify-end gap-3 border-t pt-5">

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
                : isNewTier
                  ? "Add Tier"
                  : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =============================================================
   HELPERS
============================================================= */

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