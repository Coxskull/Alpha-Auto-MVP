import axios from "axios";
import {
  CommissionPolicy,
  CommissionCalculationResult,
} from "../types/autoPartsCommission";

const API_URL =
   axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
export interface CommissionTier {
  id?: string;
  tierOrder: number;
  minimumAmount: number;
  maximumAmount: number | null;
  commissionPercentage: number;
  isActive: boolean;
}

export interface CommissionPolicy {
  id: string;
  policyName: string;
  currency: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  tiers: CommissionTier[];
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/**
 * Get the currently active auto-parts commission policy.
 */
export async function getCurrentPolicy(
  currency: string
): Promise<CommissionPolicy> {
  const response = await fetch(
    `${API_URL}/api/admin/auto-parts-commission/current?currency=${encodeURIComponent(
      currency
    )}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        `Failed to load commission policy. HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Preview the progressive commission calculation.
 */
export async function calculateCommission(
  subtotal: number,
  currency: string
): Promise<CommissionCalculationResult> {
  const response = await fetch(
    `${API_URL}/api/admin/auto-parts-commission/calculate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        subtotal,
        currency,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        `Failed to calculate commission. HTTP ${response.status}`
    );
  }

  return response.json();
}