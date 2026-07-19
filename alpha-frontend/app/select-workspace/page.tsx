"use client";

import {
  ArrowRight,
  LogOut,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  entrepreneurRoleOptions,
  getDashboardRoute,
  getPrimaryRole,
  getRoleTitle,
  getUserRoles,
} from "@/app/lib/entrepreneurRoles";

import type {
  AuthenticatedUser,
} from "@/types/entrepreneur";

type WorkspaceState = {
  user: AuthenticatedUser | null;
  roles: string[];
  authenticated: boolean;
  invalidStorage: boolean;
};

function readWorkspaceState(): WorkspaceState {
  if (typeof window === "undefined") {
    return {
      user: null,
      roles: [],
      authenticated: false,
      invalidStorage: false,
    };
  }

  const token =
    window.localStorage.getItem(
      "alpha_token"
    );

  const storedUser =
    window.localStorage.getItem(
      "alpha_user"
    );

  if (!token || !storedUser) {
    return {
      user: null,
      roles: [],
      authenticated: false,
      invalidStorage: false,
    };
  }

  try {
    const parsedUser =
      JSON.parse(
        storedUser
      ) as AuthenticatedUser;

    const roles =
      getUserRoles(parsedUser);

    return {
      user: parsedUser,
      roles,
      authenticated: true,
      invalidStorage: false,
    };
  } catch {
    return {
      user: null,
      roles: [],
      authenticated: false,
      invalidStorage: true,
    };
  }
}

export default function SelectWorkspacePage() {
  const router = useRouter();

  const [workspaceState] =
    useState<WorkspaceState>(
      readWorkspaceState
    );

  const {
    user,
    roles,
    authenticated,
    invalidStorage,
  } = workspaceState;

  useEffect(() => {
    if (invalidStorage) {
      localStorage.removeItem(
        "alpha_token"
      );

      localStorage.removeItem(
        "alpha_user"
      );

      router.replace("/login");
      return;
    }

    if (!authenticated || !user) {
      router.replace("/login");
      return;
    }

    if (roles.length === 0) {
      router.replace("/");
      return;
    }

    if (roles.length === 1) {
      router.replace(
        getDashboardRoute(roles[0])
      );
    }
  }, [
    authenticated,
    invalidStorage,
    roles,
    router,
    user,
  ]);

  function openWorkspace(
    role: string
  ) {
    localStorage.setItem(
      "alpha_active_role",
      role
    );

    router.push(
      getDashboardRoute(role)
    );
  }

  function signOut() {
    localStorage.removeItem(
      "alpha_token"
    );

    localStorage.removeItem(
      "alpha_user"
    );

    localStorage.removeItem(
      "alpha_active_role"
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

    router.replace("/login");
  }

  if (
    !authenticated ||
    !user ||
    roles.length <= 1
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your workspace...
          </p>
        </div>
      </main>
    );
  }

  const fullName =
    user.fullName ??
    user.FullName ??
    "Alpha Member";

  const primaryRole =
    getPrimaryRole(user);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-400">
              Alpha Entrepreneur Network
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Welcome, {fullName}
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Choose the Alpha workspace
              you want to use.
            </p>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const option =
              entrepreneurRoleOptions.find(
                (item) =>
                  item.key === role
              );

            const Icon =
              option?.icon;

            return (
              <button
                key={role}
                type="button"
                onClick={() =>
                  openWorkspace(role)
                }
                className="group rounded-3xl border border-white/10 bg-[#111827] p-6 text-left transition hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    {Icon ? (
                      <Icon size={24} />
                    ) : (
                      <span className="font-black">
                        A
                      </span>
                    )}
                  </div>

                  {role ===
                    primaryRole && (
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
                      Default
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-xl font-black">
                  {getRoleTitle(role)}
                </h2>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                  {option?.description ??
                    "Open this Alpha workspace."}
                </p>

                <div className="mt-5 flex items-center gap-2 font-bold text-emerald-400">
                  Open workspace

                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}