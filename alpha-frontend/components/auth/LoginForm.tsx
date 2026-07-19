"use client";

import axios from "axios";
import Link from "next/link";
import {
  useSearchParams,
  useRouter,
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

function extractLoginError(
  requestError: unknown
): string {
  if (!axios.isAxiosError(requestError)) {
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

  return "Invalid email or password.";
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
    searchParams.get("multipleRoles") === "1";

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
      const response = await api.post(
        "/api/Auth/login",
        {
          email: email
            .trim()
            .toLowerCase(),
          password,
        }
      );

      const token = response.data.token;

      const user =
        response.data.user as AuthenticatedUser;

      const userRoles =
        getUserRoles(user);

      const expectedRole =
        role === "provider"
          ? "supplier"
          : normalizeRole(role);

      if (
        expectedRole &&
        !userRoles.includes(expectedRole)
      ) {
        setError(
          "This account does not have access to this workspace."
        );

        return;
      }

      localStorage.setItem(
        "alpha_token",
        token
      );

      localStorage.setItem(
        "alpha_user",
        JSON.stringify({
          ...user,
          roles: userRoles,
          primaryRole:
            getPrimaryRole(user),
        })
      );

      const supplierId =
        user.supplierId ??
        user.SupplierId;

      if (supplierId) {
        localStorage.setItem(
          "supplierId",
          supplierId
        );
      }

      const driverId =
        user.driverId ??
        user.DriverId;

      if (driverId) {
        localStorage.setItem(
          "driverId",
          driverId
        );
      }

      const mechanicId =
        user.mechanicId ??
        user.MechanicId;

      if (mechanicId) {
        localStorage.setItem(
          "mechanicId",
          mechanicId
        );
      }

      if (redirectTo && expectedRole) {
        router.push(redirectTo);
      } else if (userRoles.length > 1) {
        router.push(
          "/select-workspace"
        );
      } else {
        const destination =
          getDashboardRoute(
            userRoles[0] ||
              getPrimaryRole(user)
          );

        router.push(destination);
      }

      router.refresh();
    } catch (requestError: unknown) {
      setError(
        extractLoginError(requestError)
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
            Your entrepreneur account was created
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
              if (event.key === "Enter") {
                void handleLogin();
              }
            }}
            placeholder="Email address"
            autoComplete="email"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-emerald-500"
          />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleLogin();
              }
            }}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-emerald-500"
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
            className="w-full rounded-2xl bg-emerald-400 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
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