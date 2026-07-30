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

    roleStatuses?: UserRoleStatus[];
    RoleStatuses?: UserRoleStatus[];
  };

const verificationStatuses = new Set([
  "pending",
  "profile_incomplete",
  "under_review",
  "rejected",
  "needs_more_information",
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

  return normalizeRole(role);
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

  try {
    const resolvedRoles =
      getUserRoles(user);

    if (!Array.isArray(resolvedRoles)) {
      return [];
    }

    return resolvedRoles
      .map((role) =>
        safeNormalizeRole(role)
      )
      .filter(Boolean);
  } catch {
    const directRoles = Array.isArray(
      user.roles
    )
      ? user.roles
      : Array.isArray(user.Roles)
        ? user.Roles
        : [];

    return directRoles
      .map((role) =>
        safeNormalizeRole(role)
      )
      .filter(Boolean);
  }
}

function clearAuthentication() {
  localStorage.removeItem("alpha_token");
  localStorage.removeItem("alpha_user");

  localStorage.removeItem("supplierId");
  localStorage.removeItem("driverId");
  localStorage.removeItem("mechanicId");
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
    let isMounted = true;

    async function checkAccess() {
      const token =
        localStorage.getItem(
          "alpha_token"
        );

      if (!token) {
        if (isMounted) {
          setStatus("blocked");
        }

        router.replace("/login");
        return;
      }

      /*
       * A missing allowedRoles property should not
       * crash the application. However, allowing
       * access without any required role would make
       * the guard ineffective, so redirect instead.
       */
      if (
        normalizedAllowedRoles.length === 0
      ) {
        console.error(
          "RoleGuard requires at least one allowed role."
        );

        if (isMounted) {
          setStatus("blocked");
        }

        router.replace("/unauthorized");
        return;
      }

      try {
        const response = await api.get(
          "/api/Auth/me"
        );

        const user =
          response.data as
            AuthenticatedUserWithStatuses;

        const roleStatuses =
          getRoleStatuses(user);

        const activeRolesFromStatuses =
          roleStatuses
            .filter(
              (item) =>
                item.status === "active"
            )
            .map((item) => item.role);

        /*
         * When roleStatuses is available, only
         * status=active roles may access guarded
         * operational workspaces.
         */
        const effectiveActiveRoles =
          roleStatuses.length > 0
            ? activeRolesFromStatuses
            : getSafeUserRoles(user);

        const uniqueActiveRoles =
          Array.from(
            new Set(
              effectiveActiveRoles
                .map((role) =>
                  safeNormalizeRole(role)
                )
                .filter(Boolean)
            )
          );

        const hasAccess =
          normalizedAllowedRoles.some(
            (allowedRole) =>
              uniqueActiveRoles.includes(
                allowedRole
              )
          );

        localStorage.setItem(
          "alpha_user",
          JSON.stringify({
            ...user,
            roles: uniqueActiveRoles,
            roleStatuses,
          })
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

          if (isMounted) {
            setStatus("blocked");
          }

          if (roleAwaitingVerification) {
            router.replace(
              "/verification"
            );
          } else {
            router.replace(
              "/unauthorized"
            );
          }

          return;
        }

        if (isMounted) {
          setStatus("allowed");
        }
      } catch (error: unknown) {
        console.error(
          "Role access check failed:",
          error
        );

        clearAuthentication();

        if (isMounted) {
          setStatus("blocked");
        }

        router.replace("/login");
      }
    }

    void checkAccess();

    return () => {
      isMounted = false;
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