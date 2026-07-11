"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post(
        "/api/Auth/forgot-password",
        {
          email,
        }
      );

      setMessage(response.data.message);
    } catch {
      setError(
        "Unable to process your password-reset request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-[#111827] p-6"
      >
        <div>
          <p className="text-sm font-bold uppercase text-green-400">
            Alpha Customer
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Reset password
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Enter the email connected to your
            customer account.
          </p>
        </div>

        <input
          type="email"
          required
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Email address"
          autoComplete="email"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-green-500"
        />

        {message && (
          <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-green-500 py-4 font-bold text-black disabled:opacity-60"
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>

        <Link
          href="/login/customer"
          className="block text-center text-sm text-green-400 hover:underline"
        >
          Back to customer login
        </Link>
      </form>
    </main>
  );
}