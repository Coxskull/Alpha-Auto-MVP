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
  allowedRoles: string[];
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
  return status
    ?.trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_") ?? "";
}

function getRoleStatuses(
  user: AuthenticatedUserWithStatuses
): Array<{
  role: string;
  status: string;
}> {
  const source =
    user.roleStatuses ??
    user.RoleStatuses ??
    [];

  return source
    .map((item) => ({
      role: normalizeRole(
        item.role ??
          item.Role ??
          item.roleKey ??
          item.RoleKey
      ),
      status: normalizeStatus(
        item.status ??
          item.Status
      ),
    }))
    .filter(
      (item) =>
        Boolean(item.role) &&
        Boolean(item.status)
    );
}

function clearAuthentication() {
  localStorage.removeItem("alpha_token");
  localStorage.removeItem("alpha_user");

  localStorage.removeItem("supplierId");
  localStorage.removeItem("driverId");
  localStorage.removeItem("mechanicId");
}

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();

  const [status, setStatus] =
    useState<GuardStatus>("checking");

  const normalizedAllowedRoles =
    useMemo(() => {
      return Array.from(
        new Set(
          allowedRoles
            .map(normalizeRole)
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

      try {
        const response = await api.get(
          "/api/Auth/me"
        );

        const user =
          response.data as
            AuthenticatedUserWithStatuses;

        const roleStatuses =
          getRoleStatuses(user);

        /*
         * Only roles whose status is "active"
         * should receive access.
         *
         * The backend should return:
         *
         * roleStatuses: [
         *   {
         *     role: "driver",
         *     status: "under_review"
         *   }
         * ]
         */
        const activeRolesFromStatuses =
          roleStatuses
            .filter(
              (item) =>
                item.status === "active"
            )
            .map((item) => item.role);

        /*
         * Backward-compatible fallback:
         *
         * If the API has not returned roleStatuses,
         * use the roles returned by the server.
         *
         * Once roleStatuses is fully implemented,
         * access will use active role records.
         */
        const effectiveActiveRoles =
          roleStatuses.length > 0
            ? activeRolesFromStatuses
            : getUserRoles(user);

        const uniqueActiveRoles =
          Array.from(
            new Set(
              effectiveActiveRoles
                .map(normalizeRole)
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

        if (!hasAccess) {
          const selectedOperationalRole =
            roleStatuses.find(
              (item) =>
                normalizedAllowedRoles.includes(
                  item.role
                ) &&
                verificationStatuses.has(
                  item.status
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

          if (isMounted) {
            setStatus("blocked");
          }

          if (selectedOperationalRole) {
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

        localStorage.setItem(
          "alpha_user",
          JSON.stringify({
            ...user,
            roles: uniqueActiveRoles,
            roleStatuses,
          })
        );

        if (isMounted) {
          setStatus("allowed");
        }
      } catch (error: unknown) {
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