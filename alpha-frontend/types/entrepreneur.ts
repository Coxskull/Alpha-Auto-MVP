export type EntrepreneurRole =
  | "driver"
  | "mechanic"
  | "supplier"
  | "customer"
  | "community_builder";

export type AlphaUserRole =
  | EntrepreneurRole
  | "provider"
  | "admin"
  | "dispatcher"
  | "tow_provider";

export type EntrepreneurRoleOption = {
  key: EntrepreneurRole;
  title: string;
  shortTitle: string;
  description: string;
  onboardingRequired: boolean;
};

export type EntrepreneurRegistrationForm = {
  fullName: string;
  email: string;
  phone: string;

  password: string;
  confirmPassword: string;

  selectedRoles: EntrepreneurRole[];
  primaryRole: EntrepreneurRole | "";

  city: string;
  state: string;
  country: string;
  preferredLanguage: string;

  businessName: string;
  entrepreneurialGoal: string;

  acceptTerms: boolean;
  acceptRewardsPolicy: boolean;
};

export type AuthenticatedUser = {
  id?: string;
  Id?: string;

  fullName?: string;
  FullName?: string;

  email?: string;
  Email?: string;

  phone?: string | null;
  Phone?: string | null;

  role?: string;
  Role?: string;

  primaryRole?: string;
  PrimaryRole?: string;

  roles?: string[];
  Roles?: string[];

  referralCode?: string | null;
  ReferralCode?: string | null;

  supplierId?: string | null;
  SupplierId?: string | null;

  driverId?: string | null;
  DriverId?: string | null;

  mechanicId?: string | null;
  MechanicId?: string | null;
};

export type LoginResponse = {
  token: string;
  user: AuthenticatedUser;
};

export type EntrepreneurEarningStatus =
  | "PENDING"
  | "APPROVED"
  | "HELD"
  | "ADJUSTED"
  | "PAID"
  | "CANCELED"
  | "REVERSED";

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

export interface EntrepreneurReferral {
  id: string;

  entrepreneurUserId: string;
  recruitedUserId: string;

  referralCode?: string | null;

  providerName?: string | null;
  providerRole?: string | null;

  referralDate?: string | null;
  providerActivationDate?: string | null;

  referralStatus?: string | null;

  isDirectReferral: boolean;

  endedAt?: string | null;
}

export interface EntrepreneurEarning {
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

  earningStatus: EntrepreneurEarningStatus;

  refundAdjustment: number;

  chargebackAdjustment: number;

  payoutBatchId?: string | null;

  payoutDate?: string | null;

  payoutReference?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface EntrepreneurProgram {
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

  currency?: string | null;
}