"use client";

import axios from "axios";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

import {
  getDashboardRoute,
  getPrimaryRole,
  getUserRoles,
  normalizeRole,
} from "@/app/lib/entrepreneurRoles";

import api from "@/services/api";

import type {
  AuthenticatedUser,
} from "@/types/entrepreneur";

type LoginRole =
  | "admin"
  | "dispatcher"
  | "customer"
  | "driver"
  | "provider"
  | "supplier"
  | "mechanic"
  | "community_builder";

type LoginFormProps = {
  role?: LoginRole;
  title?: string;
  subtitle?: string;
  redirectTo?: string;
};

type LoginUser = AuthenticatedUser & {
  role?: string;
  Role?: string;

  roles?: string[];
  Roles?: string[];

  primaryRole?: string;
  PrimaryRole?: string;

  roleStatuses?: Array<{
    role?: string;
    Role?: string;
    roleKey?: string;
    RoleKey?: string;
    status?: string;
    Status?: string;
  }>;

  RoleStatuses?: Array<{
    role?: string;
    Role?: string;
    roleKey?: string;
    RoleKey?: string;
    status?: string;
    Status?: string;
  }>;

  nextStep?: string;
  NextStep?: string;

  supplierId?: string | null;
  SupplierId?: string | null;

  driverId?: string | null;
  DriverId?: string | null;

  mechanicId?: string | null;
  MechanicId?: string | null;
};

type LoginResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;

  nextStep?: string;
  NextStep?: string;

  user?: LoginUser;
  User?: LoginUser;
};

function extractLoginError(
  requestError: unknown
): string {
  if (!axios.isAxiosError(requestError)) {
    if (
      requestError instanceof Error &&
      requestError.message
    ) {
      return requestError.message;
    }

    return "Invalid email or password.";
  }

  const data = requestError.response?.data;

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data;
  }

  return "Invalid email or password.";
}

function safeNormalizeRole(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  try {
    return normalizeRole(value);
  } catch {
    return value
      .trim()
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_");
  }
}

function normalizeStatus(
  value?: string | null
): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_") ?? ""
  );
}

function getLoginUser(
  data: LoginResponse
): LoginUser | null {
  if (
    data.user &&
    typeof data.user === "object"
  ) {
    return data.user;
  }

  if (
    data.User &&
    typeof data.User === "object"
  ) {
    return data.User;
  }

  return null;
}

function collectUserRoles(
  user: LoginUser
): string[] {
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
    // Continue using direct backend properties.
  }

  if (Array.isArray(user.roles)) {
    collectedRoles.push(
      ...user.roles
    );
  }

  if (Array.isArray(user.Roles)) {
    collectedRoles.push(
      ...user.Roles
    );
  }

  if (typeof user.role === "string") {
    collectedRoles.push(user.role);
  }

  if (typeof user.Role === "string") {
    collectedRoles.push(user.Role);
  }

  if (
    typeof user.primaryRole === "string"
  ) {
    collectedRoles.push(
      user.primaryRole
    );
  }

  if (
    typeof user.PrimaryRole === "string"
  ) {
    collectedRoles.push(
      user.PrimaryRole
    );
  }

  const statuses =
    Array.isArray(user.roleStatuses)
      ? user.roleStatuses
      : Array.isArray(user.RoleStatuses)
        ? user.RoleStatuses
        : [];

  for (const item of statuses) {
    const status = normalizeStatus(
      item.status ?? item.Status
    );

    if (
      status !== "active" &&
      status !== "approved"
    ) {
      continue;
    }

    const role =
      item.role ??
      item.Role ??
      item.roleKey ??
      item.RoleKey;

    if (role) {
      collectedRoles.push(role);
    }
  }

  return Array.from(
    new Set(
      collectedRoles
        .map((item) =>
          safeNormalizeRole(item)
        )
        .filter(Boolean)
    )
  );
}

function getResolvedPrimaryRole(
  user: LoginUser,
  userRoles: string[]
): string {
  const candidates = [
    user.primaryRole,
    user.PrimaryRole,
    user.role,
    user.Role,
  ];

  for (const candidate of candidates) {
    const normalized =
      safeNormalizeRole(candidate);

    if (normalized) {
      return normalized;
    }
  }

  try {
    const resolved =
      safeNormalizeRole(
        getPrimaryRole(user)
      );

    if (resolved) {
      return resolved;
    }
  } catch {
    // Continue to role array fallback.
  }

  return userRoles[0] ?? "customer";
}

function getBackendNextStep(
  response: LoginResponse,
  user: LoginUser
): string {
  const value =
    user.nextStep ??
    user.NextStep ??
    response.nextStep ??
    response.NextStep ??
    "";

  return typeof value === "string"
    ? value.trim()
    : "";
}

function saveOptionalId(
  key: string,
  value?: string | null
) {
  if (value?.trim()) {
    localStorage.setItem(
      key,
      value.trim()
    );
  } else {
    localStorage.removeItem(key);
  }
}

export default function LoginForm({
  role,
  title = "Alpha Member Login",
  subtitle =
    "Access your Alpha Entrepreneur Network account.",
  redirectTo,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const wasRegistered =
    searchParams.get("registered") === "1";

  const hasMultipleRoles =
    searchParams.get("multipleRoles") ===
    "1";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>(
        "/api/Auth/login",
        {
          email: email
            .trim()
            .toLowerCase(),
          password,
        }
      );

      const responseData = response.data;

      const token =
        responseData.token ??
        responseData.accessToken ??
        responseData.access_token;

      if (
        typeof token !== "string" ||
        !token.trim()
      ) {
        throw new Error(
          "The login response did not contain a valid authentication token."
        );
      }

      const user =
        getLoginUser(responseData);

      if (!user) {
        throw new Error(
          "The login response did not contain user information."
        );
      }

      const userRoles =
        collectUserRoles(user);

      const expectedRole =
        role === "provider"
          ? "supplier"
          : safeNormalizeRole(role);

      if (
        expectedRole &&
        !userRoles.includes(expectedRole)
      ) {
        setError(
          "This account does not have access to this workspace."
        );

        return;
      }

      const primaryRole =
        getResolvedPrimaryRole(
          user,
          userRoles
        );

      localStorage.setItem(
        "alpha_token",
        token.trim()
      );

      localStorage.setItem(
        "alpha_user",
        JSON.stringify({
          ...user,
          roles: userRoles,
          primaryRole,
        })
      );

      saveOptionalId(
        "supplierId",
        user.supplierId ??
          user.SupplierId
      );

      saveOptionalId(
        "driverId",
        user.driverId ??
          user.DriverId
      );

      saveOptionalId(
        "mechanicId",
        user.mechanicId ??
          user.MechanicId
      );

      window.dispatchEvent(
        new Event(
          "alpha-auth-changed"
        )
      );

      /*
       * Admin and dispatcher routing must be checked before
       * nextStep because the backend currently returns "/"
       * for the admin account.
       */
      if (
        userRoles.includes("admin") ||
        userRoles.includes("dispatcher") ||
        primaryRole === "admin" ||
        primaryRole === "dispatcher"
      ) {
        router.replace(
          "/mission-control/dashboard"
        );

        return;
      }

      /*
       * Use a role-specific redirect supplied by the page,
       * such as the driver, mechanic, or supplier login page.
       */
      if (
        redirectTo &&
        expectedRole
      ) {
        router.replace(redirectTo);

        return;
      }

      /*
       * Ignore nextStep="/" because that is the public home page
       * and would incorrectly send operational users away from
       * their dashboards.
       */
      const backendNextStep =
        getBackendNextStep(
          responseData,
          user
        );

      if (
        backendNextStep &&
        backendNextStep !== "/"
      ) {
        router.replace(
          backendNextStep
        );

        return;
      }

      if (userRoles.length > 1) {
        router.replace(
          "/select-workspace"
        );

        return;
      }

      const destination =
        getDashboardRoute(
          userRoles[0] ??
            primaryRole
        );

      router.replace(destination);
    } catch (
      requestError: unknown
    ) {
      console.error(
        "Login failed:",
        requestError
      );

      setError(
        extractLoginError(
          requestError
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827]/90 p-6 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-400">
            Alpha Entrepreneur Network
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            {subtitle}
          </p>
        </div>

        {wasRegistered && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
            Your account was created
            successfully. Sign in to continue.

            {hasMultipleRoles && (
              <p className="mt-1 text-emerald-200">
                You will choose your workspace
                after signing in.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !loading
              ) {
                void handleLogin();
              }
            }}
            placeholder="Email address"
            autoComplete="email"
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !loading
              ) {
                void handleLogin();
              }
            }}
            placeholder="Password"
            autoComplete="current-password"
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {error && (
            <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 text-sm">
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:underline"
            >
              Join Alpha
            </Link>

            <Link
              href="/forgot-password"
              className="text-gray-300 hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleLogin()
            }
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-400 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </div>
      </div>
    </main>
  );
}