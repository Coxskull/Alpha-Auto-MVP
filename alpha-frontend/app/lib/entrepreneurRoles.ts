import {
  Bike,
  Car,
  Store,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type {
  AuthenticatedUser,
  EntrepreneurRole,
  EntrepreneurRoleOption,
} from "@/types/entrepreneur";

export type EntrepreneurRoleCard =
  EntrepreneurRoleOption & {
    icon: LucideIcon;
  };

export const entrepreneurRoleOptions:
  EntrepreneurRoleCard[] = [
  {
    key: "driver",
    title: "Motorcycle Rider",
    shortTitle: "Rider",
    description:
      "Complete local deliveries, serve automotive businesses, and earn through real delivery jobs.",
    onboardingRequired: true,
    icon: Bike,
  },
  {
    key: "mechanic",
    title: "Mechanic",
    shortTitle: "Mechanic",
    description:
      "Receive repair opportunities and grow your automotive service business.",
    onboardingRequired: true,
    icon: Wrench,
  },
  {
    key: "supplier",
    title: "Auto Parts Store",
    shortTitle: "Parts Store",
    description:
      "Sell automotive products and fulfill local parts orders through Alpha.",
    onboardingRequired: true,
    icon: Store,
  },
  {
    key: "customer",
    title: "Vehicle Owner",
    shortTitle: "Vehicle Owner",
    description:
      "Purchase parts, request repairs, and access convenient automotive services.",
    onboardingRequired: false,
    icon: Car,
  },
  {
    key: "community_builder",
    title: "Community Builder",
    shortTitle: "Builder",
    description:
      "Build a local network of riders, mechanics, stores, vehicle owners, and business partners.",
    onboardingRequired: false,
    icon: Users,
  },
];

export function normalizeRole(
  role?: string | null
): string {
  const normalized = role
    ?.trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  switch (normalized) {
    case "provider":
    case "auto_parts_store":
    case "parts_store":
      return "supplier";

    case "rider":
    case "motorcycle_rider":
      return "driver";

    case "vehicle_owner":
      return "customer";

    case "builder":
    case "communitybuilder":
      return "community_builder";

    default:
      return normalized ?? "";
  }
}

export function getUserRoles(
  user: AuthenticatedUser | null | undefined
): string[] {
  if (!user) {
    return [];
  }

  const responseRoles =
    user.roles ?? user.Roles ?? [];

  const primaryRole = normalizeRole(
    user.primaryRole ??
      user.PrimaryRole ??
      user.role ??
      user.Role
  );

  return Array.from(
    new Set(
      [...responseRoles, primaryRole]
        .map(normalizeRole)
        .filter(Boolean)
    )
  );
}

export function getPrimaryRole(
  user: AuthenticatedUser | null | undefined
): string {
  if (!user) {
    return "";
  }

  return normalizeRole(
    user.primaryRole ??
      user.PrimaryRole ??
      user.role ??
      user.Role
  );
}

export function getDashboardRoute(
  role?: string | null
): string {
  switch (normalizeRole(role)) {
    case "community_builder":
      return "/entrepreneur/dashboard";

    case "driver":
      return "/driver/dashboard";

    case "mechanic":
      return "/mechanic/dashboard";

    case "supplier":
      return "/provider/dashboard";

    case "customer":
      return "/customer";

    case "admin":
    case "dispatcher":
      return "/mission-control/dashboard";

    default:
      return "/";
  }
}

export function getRoleTitle(
  role?: string | null
): string {
  switch (normalizeRole(role)) {
    case "community_builder":
      return "Community Builder";

    case "driver":
      return "Motorcycle Rider";

    case "mechanic":
      return "Mechanic";

    case "supplier":
      return "Auto Parts Store";

    case "customer":
      return "Vehicle Owner";

    case "admin":
      return "Administrator";

    case "dispatcher":
      return "Dispatcher";

    default:
      return role || "Member";
  }
}

export function isEntrepreneurRole(
  role: string
): role is EntrepreneurRole {
  return [
    "driver",
    "mechanic",
    "supplier",
    "customer",
    "community_builder",
  ].includes(normalizeRole(role));
}