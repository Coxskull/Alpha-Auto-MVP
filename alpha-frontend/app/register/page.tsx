"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

type RegistrationForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegistrationForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] =
    useState<RegistrationForm>(initialForm);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  function updateField(
    field: keyof RegistrationForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    setLoading(true);

    try {
      await api.post("/api/Auth/register", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
      });

      router.push("/login/customer?registered=1");
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(
          typeof requestError.response?.data === "string"
            ? requestError.response.data
            : "Unable to create account."
        );
      } else {
        setError("Unable to create account.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-10 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-[#111827]/90 p-6 shadow-2xl"
      >
        <div>
          <p className="text-sm font-bold uppercase text-green-400">
            Alpha Customer
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Create account
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Create your Alpha Auto customer account.
          </p>
        </div>

        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) =>
            updateField("fullName", event.target.value)
          }
          placeholder="Full name"
          autoComplete="name"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-green-500"
        />

        <input
          type="email"
          required
          value={form.email}
          onChange={(event) =>
            updateField("email", event.target.value)
          }
          placeholder="Email address"
          autoComplete="email"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-green-500"
        />

        <input
          type="tel"
          value={form.phone}
          onChange={(event) =>
            updateField("phone", event.target.value)
          }
          placeholder="Phone number (optional)"
          autoComplete="tel"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-green-500"
        />

        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(event) =>
            updateField("password", event.target.value)
          }
          placeholder="Password"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-green-500"
        />

        <input
          type="password"
          required
          minLength={8}
          value={form.confirmPassword}
          onChange={(event) =>
            updateField(
              "confirmPassword",
              event.target.value
            )
          }
          placeholder="Confirm password"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-green-500"
        />

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
            ? "Creating account..."
            : "Create Customer Account"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already registered?{" "}
          <Link
            className="text-green-400 hover:underline"
            href="/login/customer"
          >
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}