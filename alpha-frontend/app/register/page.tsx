"use client";

import axios from "axios";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe2,
  Network,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import RoleSelectionCards from "@/components/entrepreneur/RoleSelectionCards";
import api from "@/services/api";

import type {
  EntrepreneurRegistrationForm,
  EntrepreneurRole,
} from "@/types/entrepreneur";

const initialForm:
  EntrepreneurRegistrationForm = {
  fullName: "",
  email: "",
  phone: "",

  password: "",
  confirmPassword: "",

  selectedRoles: [],
  primaryRole: "",

  city: "",
  state: "",
  country: "MX",
  preferredLanguage: "es",

  businessName: "",
  entrepreneurialGoal: "",

  acceptTerms: false,
  acceptRewardsPolicy: false,
};

function extractRequestError(
  requestError: unknown
): string {
  if (!axios.isAxiosError(requestError)) {
    return "Unable to create your Alpha account.";
  }

  const responseData = requestError.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === "object"
  ) {
    const data = responseData as {
      message?: string;
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };

    if (data.message) {
      return data.message;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.errors) {
      const firstError = Object.values(
        data.errors
      ).flat()[0];

      if (firstError) {
        return firstError;
      }
    }

    if (data.title) {
      return data.title;
    }
  }

  return "Unable to create your Alpha account.";
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const referralFromUrl =
    searchParams.get("ref") ?? "";

  const [form, setForm] =
    useState<EntrepreneurRegistrationForm>(
      initialForm
    );

  const [referralCode, setReferralCode] = useState(
  () => referralFromUrl.trim().toUpperCase()
);

const [referralValidation, setReferralValidation] =
  useState<{
    code: string;
    status:
      | "idle"
      | "validating"
      | "valid"
      | "invalid";
    referrerName: string;
    error: string;
  }>(() => ({
    code: "",
    status: "idle",
    referrerName: "",
    error: "",
  }));

const normalizedReferralCode = referralCode
  .trim()
  .toUpperCase();

const referralValidationMatches =
  referralValidation.code === normalizedReferralCode;

const validatingReferral =
  normalizedReferralCode.length > 0 &&
  (!referralValidationMatches ||
    referralValidation.status === "validating");

const referrerName =
  referralValidationMatches &&
  referralValidation.status === "valid"
    ? referralValidation.referrerName
    : "";

const referralError =
  referralValidationMatches &&
  referralValidation.status === "invalid"
    ? referralValidation.error
    : "";

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const communityBuilderSelected =
    form.selectedRoles.includes(
      "community_builder"
    );

  const supplierSelected =
    form.selectedRoles.includes("supplier");

  function updateTextField(
    field:
      | "fullName"
      | "email"
      | "phone"
      | "password"
      | "confirmPassword"
      | "city"
      | "state"
      | "country"
      | "preferredLanguage"
      | "businessName"
      | "entrepreneurialGoal",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateBooleanField(
    field:
      | "acceptTerms"
      | "acceptRewardsPolicy",
    value: boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleRole(
    role: EntrepreneurRole
  ) {
    setForm((current) => {
      const currentlySelected =
        current.selectedRoles.includes(role);

      const selectedRoles =
        currentlySelected
          ? current.selectedRoles.filter(
              (selectedRole) =>
                selectedRole !== role
            )
          : [...current.selectedRoles, role];

      const primaryRole =
        selectedRoles.length === 0
          ? ""
          : selectedRoles.includes(
              current.primaryRole as EntrepreneurRole
            )
          ? current.primaryRole
          : selectedRoles[0];

      return {
        ...current,
        selectedRoles,
        primaryRole,
      };
    });
  }

  function updatePrimaryRole(
    role: EntrepreneurRole
  ) {
    setForm((current) => ({
      ...current,
      primaryRole: role,
    }));
  }

  useEffect(() => {
  const code = normalizedReferralCode;

  // No state update is needed here. Empty codes are represented
  // by the derived values above.
  if (!code) {
    return;
  }

  const abortController = new AbortController();

  const validationTimer = window.setTimeout(() => {
    setReferralValidation({
      code,
      status: "validating",
      referrerName: "",
      error: "",
    });

    void api
      .get(
        `/api/Referrals/validate/${encodeURIComponent(
          code
        )}`,
        {
          signal: abortController.signal,
        }
      )
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setReferralValidation({
          code,
          status: "valid",
          referrerName:
            response.data.referrerName ??
            response.data.fullName ??
            "Alpha member",
          error: "",
        });
      })
      .catch((requestError: unknown) => {
        if (
          axios.isCancel(requestError) ||
          abortController.signal.aborted
        ) {
          return;
        }

        setReferralValidation({
          code,
          status: "invalid",
          referrerName: "",
          error:
            "This referral code is invalid or inactive.",
        });
      });
  }, 500);

  return () => {
    window.clearTimeout(validationTimer);
    abortController.abort();
  };
}, [normalizedReferralCode]);

  function validateForm(): string | null {
    if (!form.fullName.trim()) {
      return "Enter your full name.";
    }

    if (!form.email.trim()) {
      return "Enter your email address.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (
      form.password !== form.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    if (form.selectedRoles.length === 0) {
      return "Choose at least one Alpha entrepreneur role.";
    }

    if (!form.primaryRole) {
      return "Select your default workspace.";
    }

    if (!form.city.trim()) {
      return "Enter the city where you will participate in Alpha.";
    }

    if (
      supplierSelected &&
      !form.businessName.trim()
    ) {
      return "Enter the name of your auto parts store.";
    }

    if (
      referralCode.trim() &&
      referralError
    ) {
      return "Enter a valid referral code or remove it.";
    }

    if (validatingReferral) {
      return "Referral code validation is still in progress.";
    }

    if (!form.acceptTerms) {
      return "You must accept the Alpha terms and conditions.";
    }

    if (!form.acceptRewardsPolicy) {
      return "You must accept the transaction-based rewards policy.";
    }

    return null;
  }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/Auth/register",
        {
          fullName: form.fullName.trim(),
          email: form.email
            .trim()
            .toLowerCase(),

          phone:
            form.phone.trim() || null,

          password: form.password,

          referralCode:
  normalizedReferralCode || null,

          selectedRoles:
            form.selectedRoles,

          primaryRole:
            form.primaryRole,

          city: form.city.trim(),

          state:
            form.state.trim() || null,

          country:
            form.country.trim().toUpperCase(),

          preferredLanguage:
            form.preferredLanguage,

          businessName:
            form.businessName.trim() ||
            null,

          entrepreneurialGoal:
            form.entrepreneurialGoal.trim() ||
            null,

          acceptTerms:
            form.acceptTerms,

          acceptRewardsPolicy:
            form.acceptRewardsPolicy,
        }
      );

      const registeredRoles: string[] =
        response.data?.user?.roles ??
        form.selectedRoles;

      const query = new URLSearchParams({
        registered: "1",
      });

      if (registeredRoles.length > 1) {
        query.set("multipleRoles", "1");
      }

      router.push(
        `/login?${query.toString()}`
      );
    } catch (requestError: unknown) {
      setError(
        extractRequestError(requestError)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-800 p-6 sm:p-10 lg:p-12">
          <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-950/30 blur-3xl" />

          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Globe2 size={30} />
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.22em] text-emerald-100">
              Alpha Entrepreneur Network
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Build your network.
              <br />
              Create opportunities.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/90">
              Alpha connects riders, mechanics,
              auto parts stores, vehicle owners,
              and Community Builders into one
              active local automotive ecosystem.
            </p>

            <div className="mt-9 space-y-4">
              <MissionItem
                icon={Building2}
                title="Grow local businesses"
                description="Help automotive businesses find customers, partners, and opportunities."
              />

              <MissionItem
                icon={Network}
                title="Build a real network"
                description="Connect people who actively buy, sell, repair, and deliver."
              />

              <MissionItem
                icon={TrendingUp}
                title="Earn from real activity"
                description="Rewards are connected to eligible completed transactions—not registration alone."
              />

              <MissionItem
                icon={ShieldCheck}
                title="Create lasting value"
                description="Build an entrepreneurial community that strengthens your city."
              />
            </div>

            <div className="mt-10 rounded-2xl border border-white/20 bg-black/10 p-5 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-100">
                The Alpha mindset
              </p>

              <blockquote className="mt-3 text-lg font-bold leading-7">
                “I’m building my own network,
                creating opportunities in my city,
                and helping local businesses
                succeed.”
              </blockquote>
            </div>
          </div>
        </section>

        <form
          onSubmit={submit}
          className="space-y-8 p-5 sm:p-8 lg:p-10"
        >
          <header>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-400">
              Join the movement
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Create your entrepreneur account
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Use one Alpha account to participate
              in one or more roles.
            </p>
          </header>

          <FormSection
            title="Personal information"
            description="Tell us who you are and how we can contact you."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="fullName"
                label="Full name"
                type="text"
                required
                autoComplete="name"
                placeholder="José Martinez"
                value={form.fullName}
                onChange={(value) =>
                  updateTextField(
                    "fullName",
                    value
                  )
                }
              />

              <FormInput
                id="phone"
                label="Phone number"
                type="tel"
                autoComplete="tel"
                placeholder="+52 81 1234 5678"
                value={form.phone}
                onChange={(value) =>
                  updateTextField(
                    "phone",
                    value
                  )
                }
              />
            </div>

            <FormInput
              id="email"
              label="Email address"
              type="email"
              required
              autoComplete="email"
              placeholder="jose@example.com"
              value={form.email}
              onChange={(value) =>
                updateTextField("email", value)
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="password"
                label="Password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(value) =>
                  updateTextField(
                    "password",
                    value
                  )
                }
              />

              <FormInput
                id="confirmPassword"
                label="Confirm password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(value) =>
                  updateTextField(
                    "confirmPassword",
                    value
                  )
                }
              />
            </div>
          </FormSection>

          <RoleSelectionCards
            selectedRoles={
              form.selectedRoles
            }
            primaryRole={form.primaryRole}
            onToggleRole={toggleRole}
            onPrimaryRoleChange={
              updatePrimaryRole
            }
          />

          {communityBuilderSelected && (
            <section className="rounded-2xl border border-purple-400/25 bg-purple-400/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-400/15 text-purple-300">
                  <Network size={22} />
                </div>

                <div>
                  <p className="font-black text-purple-200">
                    Your Community Builder mission
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Build a strong local automotive
                    ecosystem by connecting motorcycle
                    riders, mechanics, auto parts stores,
                    vehicle owners, and local business
                    partners.
                  </p>

                  <p className="mt-3 text-sm font-semibold leading-6 text-amber-200">
                    Inviting someone does not automatically
                    generate a reward. Rewards are earned
                    only from eligible, completed business
                    transactions.
                  </p>
                </div>
              </div>
            </section>
          )}

          <FormSection
            title="Your local network"
            description="Tell us where you will participate and grow your Alpha network."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="city"
                label="City"
                type="text"
                required
                placeholder="Monterrey"
                value={form.city}
                onChange={(value) =>
                  updateTextField("city", value)
                }
              />

              <FormInput
                id="state"
                label="State or region"
                type="text"
                placeholder="Nuevo León"
                value={form.state}
                onChange={(value) =>
                  updateTextField(
                    "state",
                    value
                  )
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">
                  Country
                </span>

                <select
                  value={form.country}
                  onChange={(event) =>
                    updateTextField(
                      "country",
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                >
                  <option value="MX">
                    Mexico
                  </option>
                  <option value="US">
                    United States
                  </option>
                  <option value="PH">
                    Philippines
                  </option>
                  <option value="CO">
                    Colombia
                  </option>
                  <option value="AR">
                    Argentina
                  </option>
                  <option value="BR">
                    Brazil
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">
                  Preferred language
                </span>

                <select
                  value={
                    form.preferredLanguage
                  }
                  onChange={(event) =>
                    updateTextField(
                      "preferredLanguage",
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                >
                  <option value="es">
                    Español
                  </option>
                  <option value="en">
                    English
                  </option>
                  <option value="pt">
                    Português
                  </option>
                </select>
              </label>
            </div>

            {(supplierSelected ||
              communityBuilderSelected) && (
              <FormInput
                id="businessName"
                label={
                  supplierSelected
                    ? "Business or auto parts store name"
                    : "Business or network name (optional)"
                }
                type="text"
                required={supplierSelected}
                placeholder="José Auto Parts"
                value={form.businessName}
                onChange={(value) =>
                  updateTextField(
                    "businessName",
                    value
                  )
                }
              />
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">
                Entrepreneurial goal
              </span>

              <textarea
                rows={4}
                value={
                  form.entrepreneurialGoal
                }
                onChange={(event) =>
                  updateTextField(
                    "entrepreneurialGoal",
                    event.target.value
                  )
                }
                placeholder="Example: I want to build a network of local riders, mechanics, and auto parts stores in Monterrey."
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />
            </label>
          </FormSection>

          <FormSection
            title="Referral information"
            description="Enter the code of the Alpha member who introduced you, when applicable."
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">
                Referral code
                <span className="ml-2 font-normal text-slate-500">
                  Optional
                </span>
              </span>

              <input
                id="referralCode"
                type="text"
                value={referralCode}
               onChange={(event) => {
  setReferralCode(
    event.target.value.toUpperCase()
  );
}}
                placeholder="Example: CARLOS-A83K2L"
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 uppercase text-white outline-none placeholder:normal-case placeholder:text-slate-600 focus:border-purple-400"
              />
            </label>

            {validatingReferral && (
              <p className="text-sm text-slate-400">
                Validating referral code...
              </p>
            )}

            {referrerName &&
              !validatingReferral && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 size={18} />

                  Invited by {referrerName}
                </div>
              )}

            {referralError &&
              !validatingReferral && (
                <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm font-semibold text-rose-300">
                  {referralError}
                </p>
              )}
          </FormSection>

          <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <AgreementCheckbox
              checked={form.acceptTerms}
              onChange={(checked) =>
                updateBooleanField(
                  "acceptTerms",
                  checked
                )
              }
            >
              I accept the Alpha terms and
              conditions and confirm that the
              information I provided is accurate.
            </AgreementCheckbox>

            <AgreementCheckbox
              checked={
                form.acceptRewardsPolicy
              }
              onChange={(checked) =>
                updateBooleanField(
                  "acceptRewardsPolicy",
                  checked
                )
              }
            >
              I understand that Alpha rewards are
              earned only from eligible completed
              business transactions—not simply for
              inviting or registering another person.
            </AgreementCheckbox>
          </section>

          {error && (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm font-semibold text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              validatingReferral
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Joining the network..."
              : "Join the Alpha Entrepreneur Network"}

            {!loading && (
              <ArrowRight size={20} />
            )}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already an Alpha member?{" "}
            <Link
              className="font-bold text-emerald-400 hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

type MissionItemProps = {
  icon: typeof Building2;
  title: string;
  description: string;
};

function MissionItem({
  icon: Icon,
  title,
  description,
}: MissionItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
        <Icon size={20} />
      </div>

      <div>
        <p className="font-bold">{title}</p>

        <p className="mt-1 text-sm leading-6 text-emerald-50/80">
          {description}
        </p>
      </div>
    </div>
  );
}

type FormSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

type FormInputProps = {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  onChange: (value: string) => void;
};

function FormInput({
  id,
  label,
  type,
  value,
  placeholder,
  required,
  minLength,
  autoComplete,
  onChange,
}: FormInputProps) {
  return (
    <label
      htmlFor={id}
      className="block"
    >
      <span className="mb-2 block text-sm font-bold text-slate-200">
        {label}

        {!required && (
          <span className="ml-2 font-normal text-slate-500">
            Optional
          </span>
        )}
      </span>

      <input
        id={id}
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
      />
    </label>
  );
}

type AgreementCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
};

function AgreementCheckbox({
  checked,
  onChange,
  children,
}: AgreementCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-5 w-5 rounded border-white/20 bg-slate-950 accent-emerald-400"
      />

      <span className="text-sm leading-6 text-slate-300">
        {children}
      </span>
    </label>
  );
}