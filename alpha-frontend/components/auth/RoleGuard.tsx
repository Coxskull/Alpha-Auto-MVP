"use client";

import {
  useEffect,
  useMemo,
  useState,
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
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();

  const [status, setStatus] =
    useState<
      "checking" | "allowed" | "blocked"
    >("checking");

  const normalizedAllowedRoles =
    useMemo(
      () =>
        allowedRoles
          .map(normalizeRole)
          .filter(Boolean),
      [allowedRoles]
    );

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const token =
        localStorage.getItem(
          "alpha_token"
        );

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get(
          "/api/Auth/me"
        );

        const user =
          response.data as AuthenticatedUser;

        const userRoles =
          getUserRoles(user);

        const hasAccess =
          normalizedAllowedRoles.some(
            (allowedRole) =>
              userRoles.includes(allowedRole)
          );

        if (!hasAccess) {
          if (active) {
            setStatus("blocked");
          }

          router.replace(
            "/unauthorized"
          );

          return;
        }

        localStorage.setItem(
          "alpha_user",
          JSON.stringify({
            ...user,
            roles: userRoles,
          })
        );

        if (active) {
          setStatus("allowed");
        }
      } catch {
        localStorage.removeItem(
          "alpha_token"
        );

        localStorage.removeItem(
          "alpha_user"
        );

        router.replace("/login");
      }
    }

    void checkAuth();

    return () => {
      active = false;
    };
  }, [
    router,
    normalizedAllowedRoles,
  ]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />

          <p className="mt-4 text-sm text-slate-400">
            Checking access...
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