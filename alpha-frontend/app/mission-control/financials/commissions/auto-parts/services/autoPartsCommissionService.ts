import api from "@/services/api";

import type {
  CommissionPolicy,
  CommissionCalculationResult,
  CommissionTier,
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

/**
 * Update an existing commission tier.
 */
export async function updateTier(
  tierId: string,
  data: {
    minimumAmount: number;
    maximumAmount: number | null;
    commissionPercentage: number;
    isActive: boolean;
  }
): Promise<CommissionTier> {
  const response = await api.put<CommissionTier>(
    `/api/admin/auto-parts-commission/tiers/${tierId}`,
    data
  );

  return response.data;
}

/**
 * Create a new commission tier.
 */
export async function createTier(
  policyId: string,
  data: {
    minimumAmount: number;
    maximumAmount: number | null;
    commissionPercentage: number;
    isActive: boolean;
  }
): Promise<CommissionTier> {
  const response = await api.post<CommissionTier>(
    `/api/admin/auto-parts-commission/policies/${policyId}/tiers`,
    data
  );

  return response.data;
}

/**
 * Deactivate/delete a commission tier.
 *
 * Backend performs a soft delete by setting IsActive = false.
 */
export async function deleteTier(
  tierId: string
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/api/admin/auto-parts-commission/tiers/${tierId}`
  );

  return response.data;
}

/**
 * Activate/deactivate a tier.
 */
export async function updateTierStatus(
  tierId: string,
  isActive: boolean
): Promise<CommissionTier> {
  const response = await api.patch<CommissionTier>(
    `/api/admin/auto-parts-commission/tiers/${tierId}/status`,
    {
      isActive,
    }
  );

  return response.data;
}