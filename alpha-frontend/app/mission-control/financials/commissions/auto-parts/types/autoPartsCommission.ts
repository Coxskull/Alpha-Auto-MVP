export interface CommissionTier {
  id: string;
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
  notes?: string | null;
  tiers: CommissionTier[];
}

export interface CommissionCalculationLine {
  tierId: string;
  tierOrder: number;
  tierMinimum: number;
  tierMaximum: number | null;
  tierPercentage: number;
  amountInTier: number;
  commissionAmount: number;
}

export interface CommissionCalculationResult {
  policyId: string;
  policyVersion: number;
  currency: string;
  partsSubtotal: number;
  totalCommission: number;
  effectiveCommissionRate: number;
  lines: CommissionCalculationLine[];
}