import api from "@/services/api";

import type {
  CommissionPolicy,
  CommissionCalculationResult,
} from "../types/autoPartsCommission";

/**
 * Get the currently active auto-parts commission policy.
 */
export async function getCurrentPolicy(
  currency: string
): Promise<CommissionPolicy> {
  const response = await api.get<CommissionPolicy>(
    "/api/admin/auto-parts-commission/current",
    {
      params: {
        currency,
      },
    }
  );

  return response.data;
}

/**
 * Preview the progressive commission calculation.
 */
export async function calculateCommission(
  subtotal: number,
  currency: string
): Promise<CommissionCalculationResult> {
  const response =
    await api.post<CommissionCalculationResult>(
      "/api/admin/auto-parts-commission/calculate",
      {
        subtotal,
        currency,
      }
    );

  return response.data;
}