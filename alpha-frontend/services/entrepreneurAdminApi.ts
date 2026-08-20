import api from "./api";

export interface EntrepreneurProgramConfiguration {
  id: string;
  programEnabled: boolean;
  defaultCommissionRate: number;
  minimumPayoutThreshold: number;
  payoutFrequency: string;
  qualifyingProviderRoles: string[];
  qualifyingTransactionTypes: string[];
  holdingPeriodDays: number;
  maximumReferralLevel: number;
  programStartDate?: string | null;
  programEndDate?: string | null;
  updatedAt?: string;
}

export interface EntrepreneurReferralAdmin {
  id: string;
  entrepreneurUserId: string;
  recruitedUserId: string;
  referralCode?: string | null;
  referralDate?: string | null;
  providerActivationDate?: string | null;
  referralStatus?: string | null;
  isDirectReferral: boolean;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface EntrepreneurEarningAdmin {
  id: string;
  entrepreneurUserId: string;
  recruiterId: string;
  recruitedProviderId: string;
  providerRole: string;
  orderId: string;
  transactionId: string;
  paymentId: string;
  transactionDate: string;
  alphaGrossPlatformCommission: number;
  directTransactionCosts: number;
  eligibleNetPlatformRevenue: number;
  entrepreneurPercentage: number;
  entrepreneurEarningsAmount: number;
  currency: string;
  earningStatus: string;
  refundAdjustment: number;
  chargebackAdjustment: number;
  createdAt: string;
  updatedAt: string;
}

export interface EntrepreneurAdminSummary {
  totalReferrals: number;
  directReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  approvedEarnings: number;
  paidEarnings: number;
  adjustedEarnings: number;
}

export interface EntrepreneurDashboard {
  referralCode: string;
  referralLink: string;

  directRecruits: number;
  activeProviders: number;
  qualifyingTransactions: number;

  eligibleNetPlatformRevenue: number;

  pendingEarnings: number;
  approvedEarnings: number;
  paidEarnings: number;

  currentRate: number;

  currency: string;

  nextPayoutDate?: string | null;
}

export async function getEntrepreneurConfiguration(): Promise<EntrepreneurProgramConfiguration | null> {
  const response = await api.get(
    "/api/admin/entrepreneur/configuration"
  );

  return response.data;
}

export async function updateEntrepreneurConfiguration(
  data: EntrepreneurProgramConfiguration
): Promise<EntrepreneurProgramConfiguration> {
  const response = await api.put(
    "/api/admin/entrepreneur/configuration",
    data
  );

  return response.data;
}

export async function getEntrepreneurAdminSummary(): Promise<EntrepreneurAdminSummary> {
  const response = await api.get(
    "/api/admin/entrepreneur/summary"
  );

  return response.data;
}

export async function getEntrepreneurAdminReferrals(): Promise<
  EntrepreneurReferralAdmin[]
> {
  const response = await api.get(
    "/api/admin/entrepreneur/referrals"
  );

  return response.data;
}

export async function getEntrepreneurAdminEarnings(): Promise<
  EntrepreneurEarningAdmin[]
> {
  const response = await api.get(
    "/api/admin/entrepreneur/earnings"
  );

  return response.data;
}

export async function getEntrepreneurDashboard(): Promise<EntrepreneurDashboard> {
  const response = await api.get(
    "/api/entrepreneur/dashboard"
  );

  return response.data;
}