"use client";

import { CommissionPolicy } from "../types/autoPartsCommission";

interface CommissionPolicyHeaderProps {
  policy: CommissionPolicy;
}

export default function CommissionPolicyHeader({
  policy,
}: CommissionPolicyHeaderProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {policy.policyName}
            </h2>

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

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>
              Currency:{" "}
              <strong className="text-gray-700">
                {policy.currency}
              </strong>
            </span>

            <span>
              Version:{" "}
              <strong className="text-gray-700">
                {policy.version}
              </strong>
            </span>

            <span>
              Effective:{" "}
              <strong className="text-gray-700">
                {new Date(policy.effectiveFrom).toLocaleDateString()}
              </strong>
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
          <div className="text-gray-500">
            Policy Version
          </div>

          <div className="text-2xl font-bold text-gray-900">
            v{policy.version}
          </div>
        </div>

      </div>

      {policy.notes && (
        <div className="mt-4 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
          <strong>Notes:</strong> {policy.notes}
        </div>
      )}
    </div>
  );
}