import api from "@/services/api";

export type ReferralSummary = {
  directMembers: number;
  totalNetworkMembers: number;
  activeNetworkMembers: number;
  networkTransactions: number;
  pendingEarnings: number;
  availableEarnings: number;
  paidEarnings: number;
  lifetimeEarnings: number;
  currency: string;
};

export type ReferralMember = {
  userId: string;
  fullName: string;
  role: string;
  referralCode?: string | null;
  level: number;
  referredByUserId?: string | null;
  referredByName?: string | null;
  joinedAt: string;
  transactionCount: number;
  generatedVolume: number;
  generatedCommission: number;
  isActive: boolean;
};

export type ReferralTransaction = {
  id: string;
  sourceUserId: string;
  sourceUserName: string;
  sourceRole: string;
  transactionType: string;
  description?: string | null;
  referralLevel: number;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type ReferralDashboard = {
  referralCode: string;
  referralLink: string;
  summary: ReferralSummary;
  directMembers: ReferralMember[];
  networkMembers: ReferralMember[];
  recentTransactions: ReferralTransaction[];
};

export async function getReferralDashboard():
  Promise<ReferralDashboard> {
  const response = await api.get<ReferralDashboard>(
    "/api/Referrals/dashboard"
  );

  return response.data;
}