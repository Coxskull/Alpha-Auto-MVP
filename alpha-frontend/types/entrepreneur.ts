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