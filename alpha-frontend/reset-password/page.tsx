"use client";

import axios from "axios";
import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("The password-reset token is missing.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/Auth/reset-password",
        {
          token,
          newPassword: password,
        }
      );

      setMessage(response.data.message);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(
          typeof requestError.response?.data === "string"
            ? requestError.response.data
            : "The reset link is invalid or expired."
        );
      } else {
        setError(
          "The reset link is invalid or expired."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-[#111827] p-6"
    >
      <div>
        <p className="text-sm font-bold uppercase text-green-400">
          Alpha Customer
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Choose new password
        </h1>
      </div>

      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
        placeholder="New password"
        autoComplete="new-password"
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
      />

      <input
        type="password"
        required
        minLength={8}
        value={confirmPassword}
        onChange={(event) =>
          setConfirmPassword(event.target.value)
        }
        placeholder="Confirm new password"
        autoComplete="new-password"
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
      />

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {message}{" "}
          <Link
            href="/login/customer"
            className="font-semibold underline"
          >
            Sign in
          </Link>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || Boolean(message)}
        className="w-full rounded-2xl bg-green-500 py-4 font-bold text-black disabled:opacity-60"
      >
        {loading
          ? "Resetting..."
          : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
      <Suspense fallback={<p>Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}