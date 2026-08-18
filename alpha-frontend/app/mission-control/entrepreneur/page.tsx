"use client";

import { useEffect, useState } from "react";

import {
  getEntrepreneurConfiguration,
  updateEntrepreneurConfiguration,
  type EntrepreneurProgramConfiguration,
} from "@/services/entrepreneurAdminApi";

export default function EntrepreneurMissionControlPage() {
  const [config, setConfig] =
    useState<EntrepreneurProgramConfiguration | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadConfiguration() {
  try {
    setLoading(true);
    setError(null);

    const data = await getEntrepreneurConfiguration();

    if (data) {
      setConfig(data);
    } else {
      setConfig({
        id: "",
        programEnabled: false,
        defaultCommissionRate: 0.05,
        minimumPayoutThreshold: 0,
        payoutFrequency: "twice_monthly",
        qualifyingProviderRoles: [
          "driver",
          "mechanic",
          "supplier",
        ],
        qualifyingTransactionTypes: [
          "customer_order",
        ],
        holdingPeriodDays: 0,
        maximumReferralLevel: 1,
        programStartDate: null,
        programEndDate: null,
      });
    }
  } catch (err: unknown) {
    console.error(
      "Failed to load Entrepreneur configuration:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to load Entrepreneur configuration."
    );
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  let cancelled = false;

  async function initializeConfiguration() {
    try {
      const data = await getEntrepreneurConfiguration();

      if (cancelled) {
        return;
      }

      if (data) {
        setConfig(data);
      } else {
        setConfig({
          id: "",
          programEnabled: false,
          defaultCommissionRate: 0.05,
          minimumPayoutThreshold: 0,
          payoutFrequency: "twice_monthly",
          qualifyingProviderRoles: [
            "driver",
            "mechanic",
            "supplier",
          ],
          qualifyingTransactionTypes: [
            "customer_order",
          ],
          holdingPeriodDays: 0,
          maximumReferralLevel: 1,
          programStartDate: null,
          programEndDate: null,
        });
      }

      setError(null);
    } catch (err: unknown) {
      if (cancelled) {
        return;
      }

      console.error(
        "Failed to load Entrepreneur configuration:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Entrepreneur configuration."
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void initializeConfiguration();

  return () => {
    cancelled = true;
  };
}, []);

  function updateField<K extends keyof EntrepreneurProgramConfiguration>(
    field: K,
    value: EntrepreneurProgramConfiguration[K]
  ) {
    setConfig((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }
async function saveConfiguration() {
  if (!config) return;

  try {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const updated =
      await updateEntrepreneurConfiguration(config);

    setConfig(updated);

    setSuccess(
      "Entrepreneur Network configuration updated successfully."
    );
  } catch (err: unknown) {
    console.error(
      "Failed to update Entrepreneur configuration:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to update Entrepreneur configuration."
    );
  } finally {
    setSaving(false);
  }
}

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          Loading Entrepreneur Network...
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load Entrepreneur configuration.
        </div>
      </div>
    );
  }

  const commissionPercent =
    Number(config.defaultCommissionRate || 0) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Entrepreneur Network
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage the Alpha Entrepreneur referral and
            commission program.
          </p>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Program Status
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  config.programEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {config.programEnabled
                  ? "ACTIVE"
                  : "DISABLED"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Entrepreneur Rate
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {commissionPercent.toFixed(2)}%
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Referral Levels
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {config.maximumReferralLevel}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Direct referrals only
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Payout Frequency
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {formatPayoutFrequency(
                config.payoutFrequency
              )}
            </p>
          </div>

        </div>

        {/* PROGRAM CONFIGURATION */}

        <div className="rounded-xl border bg-white shadow-sm">

          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Program Configuration
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control the rules used by the Entrepreneur
              commission engine.
            </p>
          </div>

          <div className="space-y-6 p-6">

            {/* ENABLE */}

            <div className="flex items-center justify-between rounded-lg border p-4">

              <div>
                <p className="font-medium text-gray-900">
                  Entrepreneur Network
                </p>

                <p className="text-sm text-gray-500">
                  Enable or disable the Entrepreneur program.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "programEnabled",
                    !config.programEnabled
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  config.programEnabled
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.programEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>

            </div>

            {/* COMMISSION RATE */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Commission Rate
              </label>

              <div className="mt-2 flex items-center gap-3">

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionPercent}
                  onChange={(e) =>
                    updateField(
                      "defaultCommissionRate",
                      Number(e.target.value) / 100
                    )
                  }
                  className="w-40 rounded-lg border px-3 py-2"
                />

                <span className="text-sm text-gray-500">
                  %
                </span>

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Example: 5% is stored by the API as 0.05.
              </p>
            </div>

            {/* MINIMUM PAYOUT */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Payout Threshold
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  config.minimumPayoutThreshold
                }
                onChange={(e) =>
                  updateField(
                    "minimumPayoutThreshold",
                    Number(e.target.value)
                  )
                }
                className="mt-2 w-full max-w-md rounded-lg border px-3 py-2"
              />
            </div>

            {/* PAYOUT FREQUENCY */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payout Frequency
              </label>

              <select
                value={config.payoutFrequency}
                onChange={(e) =>
                  updateField(
                    "payoutFrequency",
                    e.target.value
                  )
                }
                className="mt-2 w-full max-w-md rounded-lg border px-3 py-2"
              >
                <option value="twice_monthly">
                  Twice Monthly
                </option>

                <option value="monthly">
                  Monthly
                </option>

                <option value="weekly">
                  Weekly
                </option>
              </select>
            </div>

            {/* HOLDING PERIOD */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Holding Period
              </label>

              <div className="mt-2 flex items-center gap-3">

                <input
                  type="number"
                  min="0"
                  value={
                    config.holdingPeriodDays
                  }
                  onChange={(e) =>
                    updateField(
                      "holdingPeriodDays",
                      Number(e.target.value)
                    )
                  }
                  className="w-40 rounded-lg border px-3 py-2"
                />

                <span className="text-sm text-gray-500">
                  days
                </span>

              </div>
            </div>

            {/* REFERRAL LEVEL */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Referral Level
              </label>

              <input
                type="number"
                value={1}
                disabled
                className="mt-2 w-40 rounded-lg border bg-gray-100 px-3 py-2 text-gray-600"
              />

              <p className="mt-1 text-xs text-gray-500">
                Alpha Entrepreneur Network currently
                supports direct referrals only.
              </p>
            </div>

            {/* PROVIDER ROLES */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Qualifying Provider Roles
              </label>

              <div className="mt-3 flex flex-wrap gap-3">

                {[
                  "driver",
                  "mechanic",
                  "supplier",
                ].map((role) => {

                  const selected =
                    config.qualifyingProviderRoles?.includes(
                      role
                    );

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {

                        const current =
                          config.qualifyingProviderRoles ||
                          [];

                        const updated = selected
                          ? current.filter(
                              (x) => x !== role
                            )
                          : [...current, role];

                        updateField(
                          "qualifyingProviderRoles",
                          updated
                        );
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm ${
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-600"
                      }`}
                    >
                      {capitalize(role)}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* TRANSACTION TYPES */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Qualifying Transaction Types
              </label>

              <div className="mt-3 flex flex-wrap gap-3">

                {[
                  "customer_order",
                  "service_request",
                ].map((type) => {

                  const selected =
                    config.qualifyingTransactionTypes?.includes(
                      type
                    );

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {

                        const current =
                          config.qualifyingTransactionTypes ||
                          [];

                        const updated = selected
                          ? current.filter(
                              (x) => x !== type
                            )
                          : [...current, type];

                        updateField(
                          "qualifyingTransactionTypes",
                          updated
                        );
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm ${
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-600"
                      }`}
                    >
                      {formatTransactionType(type)}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* DATES */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Program Start Date
                </label>

                <input
                  type="datetime-local"
                  value={toDateTimeLocal(
                    config.programStartDate
                  )}
                  onChange={(e) =>
                    updateField(
                      "programStartDate",
                      e.target.value
                        ? new Date(
                            e.target.value
                          ).toISOString()
                        : null
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Program End Date
                </label>

                <input
                  type="datetime-local"
                  value={toDateTimeLocal(
                    config.programEndDate
                  )}
                  onChange={(e) =>
                    updateField(
                      "programEndDate",
                      e.target.value
                        ? new Date(
                            e.target.value
                          ).toISOString()
                        : null
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2"
                />
              </div>

            </div>

            {/* SAVE */}

            <div className="flex justify-end border-t pt-6">

              <button
                type="button"
                onClick={saveConfiguration}
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Configuration"}
              </button>

            </div>

          </div>
        </div>

        {/* BUSINESS RULES */}

        <div className="rounded-xl border bg-white shadow-sm">

          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">
              Entrepreneur Network Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

            <Rule
              title="Direct Referral Only"
              description="Only the entrepreneur who directly recruited the provider can qualify."
            />

            <Rule
              title="No Downline Commission"
              description="Second-level, third-level and deeper referrals do not generate commission."
            />

            <Rule
              title="Payment Required"
              description="Registration or recruitment alone does not create an earning."
            />

            <Rule
              title="Provider Activation Required"
              description="The recruited provider must pass Alpha's existing verification and activation process."
            />

            <Rule
              title="Net Revenue Basis"
              description="Entrepreneur commission is calculated from eligible net platform revenue, not customer transaction value."
            />

            <Rule
              title="Ledger Based"
              description="Entrepreneur earnings are recorded in the internal earnings ledger before payout."
            />

          </div>

        </div>

        {/* IMPORTANT FINANCIAL EXPLANATION */}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">

          <h3 className="font-semibold text-blue-900">
            Commission Calculation
          </h3>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Alpha first calculates its gross platform
            commission. Direct transaction costs are then
            deducted to determine eligible net platform
            revenue. The Entrepreneur percentage is applied
            only to that eligible net amount.
          </p>

          <div className="mt-4 rounded-lg bg-white p-4 font-mono text-sm text-gray-800">
            Eligible Net Platform Revenue
            <br />
            =
            <br />
            Alpha Gross Platform Commission
            <br />
            -
            <br />
            Direct Transaction Costs
            <br />
            <br />
            Entrepreneur Commission
            <br />
            =
            <br />
            Eligible Net Platform Revenue ×
            Entrepreneur Rate
          </div>

        </div>

      </div>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function Rule({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium text-gray-900">
        {title}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatTransactionType(value: string) {
  return value
    .split("_")
    .map(capitalize)
    .join(" ");
}

function formatPayoutFrequency(value: string) {
  switch (value) {
    case "twice_monthly":
      return "Twice Monthly";

    case "monthly":
      return "Monthly";

    case "weekly":
      return "Weekly";

    default:
      return value;
  }
}

function toDateTimeLocal(
  value?: string | null
) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}