"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  getUserRoles,
  normalizeRole,
} from "@/app/lib/entrepreneurRoles";

import api from "@/services/api";

import type {
  AuthenticatedUser,
} from "@/types/entrepreneur";

type RoleGuardProps = {
  allowedRoles?: string[];
  children: ReactNode;
};

type GuardStatus =
  | "checking"
  | "allowed"
  | "blocked";

type UserRoleStatus = {
  role?: string;
  Role?: string;

  roleKey?: string;
  RoleKey?: string;

  status?: string;
  Status?: string;
};

type AuthenticatedUserWithStatuses =
  AuthenticatedUser & {
    roles?: string[];
    Roles?: string[];

    role?: string;
    Role?: string;

    roleStatuses?: UserRoleStatus[];
    RoleStatuses?: UserRoleStatus[];

    nextStep?: string;
    NextStep?: string;
  };

type AuthMeResponse = {
  user?: AuthenticatedUserWithStatuses;
  User?: AuthenticatedUserWithStatuses;
};

const verificationStatuses = new Set([
  "pending",
  "profile_incomplete",
  "under_review",
  "rejected",
  "needs_more_information",
]);

/*
 * Roles that do not require operational verification.
 *
 * These roles are allowed from the normal roles array even when
 * roleStatuses contains driver, mechanic, or supplier entries.
 */
const nonVerificationRoles = new Set([
  "admin",
  "customer",
]);

function normalizeStatus(
  status?: string | null
): string {
  return (
    status
      ?.trim()
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_") ?? ""
  );
}

function safeNormalizeRole(
  role?: string | null
): string {
  if (!role) {
    return "";
  }

  try {
    return normalizeRole(role);
  } catch {
    return role
      .trim()
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_");
  }
}

function unwrapAuthenticatedUser(
  data: unknown
): AuthenticatedUserWithStatuses | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const response =
    data as AuthMeResponse &
      AuthenticatedUserWithStatuses;

  if (
    response.user &&
    typeof response.user === "object"
  ) {
    return response.user;
  }

  if (
    response.User &&
    typeof response.User === "object"
  ) {
    return response.User;
  }

  return response;
}

function getRoleStatuses(
  user?: AuthenticatedUserWithStatuses | null
): Array<{
  role: string;
  status: string;
}> {
  if (!user) {
    return [];
  }

  const source = Array.isArray(
    user.roleStatuses
  )
    ? user.roleStatuses
    : Array.isArray(user.RoleStatuses)
      ? user.RoleStatuses
      : [];

  return source
    .map((item) => {
      const role = safeNormalizeRole(
        item?.role ??
          item?.Role ??
          item?.roleKey ??
          item?.RoleKey
      );

      const status = normalizeStatus(
        item?.status ??
          item?.Status
      );

      return {
        role,
        status,
      };
    })
    .filter(
      (item) =>
        Boolean(item.role) &&
        Boolean(item.status)
    );
}

function getSafeUserRoles(
  user?: AuthenticatedUserWithStatuses | null
): string[] {
  if (!user) {
    return [];
  }

  const collectedRoles: string[] = [];

  try {
    const resolvedRoles =
      getUserRoles(user);

    if (Array.isArray(resolvedRoles)) {
      collectedRoles.push(
        ...resolvedRoles
      );
    }
  } catch {
    // Continue using direct role properties.
  }

  if (Array.isArray(user.roles)) {
    collectedRoles.push(...user.roles);
  }

  if (Array.isArray(user.Roles)) {
    collectedRoles.push(...user.Roles);
  }

  if (typeof user.role === "string") {
    collectedRoles.push(user.role);
  }

  if (typeof user.Role === "string") {
    collectedRoles.push(user.Role);
  }

  return Array.from(
    new Set(
      collectedRoles
        .map((role) =>
          safeNormalizeRole(role)
        )
        .filter(Boolean)
    )
  );
}

function getEffectiveActiveRoles(
  user: AuthenticatedUserWithStatuses
): {
  activeRoles: string[];
  roleStatuses: Array<{
    role: string;
    status: string;
  }>;
} {
  const roleStatuses =
    getRoleStatuses(user);

  const directRoles =
    getSafeUserRoles(user);

  const rolesWithStatus = new Set(
    roleStatuses.map(
      (item) => item.role
    )
  );

  /*
   * Roles explicitly marked active by the backend.
   */
  const activeStatusRoles =
    roleStatuses
      .filter(
        (item) =>
          item.status === "active" ||
          item.status === "approved"
      )
      .map((item) => item.role);

  /*
   * Keep roles that do not require verification, such as admin
   * and customer, even when operational role statuses exist.
   *
   * Also retain a role when the backend has not returned any
   * role-status entry for that particular role.
   */
  const directActiveRoles =
    directRoles.filter(
      (role) =>
        nonVerificationRoles.has(role) ||
        !rolesWithStatus.has(role)
    );

  return {
    activeRoles: Array.from(
      new Set([
        ...activeStatusRoles,
        ...directActiveRoles,
      ])
    ),
    roleStatuses,
  };
}

function clearAuthentication() {
  localStorage.removeItem(
    "alpha_token"
  );

  localStorage.removeItem(
    "alpha_user"
  );

  localStorage.removeItem(
    "supplierId"
  );

  localStorage.removeItem(
    "driverId"
  );

  localStorage.removeItem(
    "mechanicId"
  );
}

export default function RoleGuard({
  allowedRoles = [],
  children,
}: RoleGuardProps) {
  const router = useRouter();

  const [status, setStatus] =
    useState<GuardStatus>("checking");

  const normalizedAllowedRoles =
    useMemo(() => {
      const safeAllowedRoles =
        Array.isArray(allowedRoles)
          ? allowedRoles
          : [];

      return Array.from(
        new Set(
          safeAllowedRoles
            .map((role) =>
              safeNormalizeRole(role)
            )
            .filter(Boolean)
        )
      );
    }, [allowedRoles]);

  useEffect(() => {
    let cancelled = false;

    const timeoutId =
      window.setTimeout(() => {
        async function checkAccess() {
          const token =
            localStorage.getItem(
              "alpha_token"
            );

          if (!token) {
            if (!cancelled) {
              setStatus("blocked");

              router.replace(
                "/login"
              );
            }

            return;
          }

          if (
            normalizedAllowedRoles.length === 0
          ) {
            console.error(
              "RoleGuard requires at least one allowed role."
            );

            if (!cancelled) {
              setStatus("blocked");

              router.replace(
                "/unauthorized"
              );
            }

            return;
          }

          try {
            const response =
              await api.get(
                "/api/Auth/me"
              );

            const user =
              unwrapAuthenticatedUser(
                response.data
              );

            if (!user) {
              throw new Error(
                "The authentication response did not contain a user."
              );
            }

            const {
              activeRoles,
              roleStatuses,
            } =
              getEffectiveActiveRoles(
                user
              );

            const hasAccess =
              normalizedAllowedRoles.some(
                (allowedRole) =>
                  activeRoles.includes(
                    allowedRole
                  )
              );

            localStorage.setItem(
              "alpha_user",
              JSON.stringify({
                ...user,
                roles: activeRoles,
                roleStatuses,
              })
            );

            console.log(
              "RoleGuard access check",
              {
                allowedRoles:
                  normalizedAllowedRoles,
                directRoles:
                  getSafeUserRoles(user),
                activeRoles,
                roleStatuses,
                hasAccess,
              }
            );

            if (!hasAccess) {
              const roleAwaitingVerification =
                roleStatuses.find(
                  (item) =>
                    normalizedAllowedRoles.includes(
                      item.role
                    ) &&
                    verificationStatuses.has(
                      item.status
                    )
                );

              if (!cancelled) {
                setStatus("blocked");

                if (
                  roleAwaitingVerification
                ) {
                  router.replace(
                    "/verification"
                  );
                } else {
                  router.replace(
                    "/unauthorized"
                  );
                }
              }

              return;
            }

            if (!cancelled) {
              setStatus("allowed");
            }
          } catch (error: unknown) {
            console.error(
              "Role access check failed:",
              error
            );

            if (!cancelled) {
              clearAuthentication();

              setStatus("blocked");

              router.replace(
                "/login"
              );
            }
          }
        }

        void checkAccess();
      }, 0);

    return () => {
      cancelled = true;

      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    router,
    normalizedAllowedRoles,
  ]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />

          <p className="mt-4 text-sm text-slate-400">
            Checking account access...
          </p>
        </div>
      </main>
    );
  }

  if (status === "blocked") {
    return null;
  }

  return <>{children}</>;
}