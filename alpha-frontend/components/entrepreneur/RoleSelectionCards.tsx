"use client";

import { Check } from "lucide-react";

import {
  entrepreneurRoleOptions,
} from "@/app/lib/entrepreneurRoles";

import type {
  EntrepreneurRole,
} from "@/types/entrepreneur";

type RoleSelectionCardsProps = {
  selectedRoles: EntrepreneurRole[];
  primaryRole: EntrepreneurRole | "";
  onToggleRole: (
    role: EntrepreneurRole
  ) => void;
  onPrimaryRoleChange: (
    role: EntrepreneurRole
  ) => void;
};

export default function RoleSelectionCards({
  selectedRoles,
  primaryRole,
  onToggleRole,
  onPrimaryRoleChange,
}: RoleSelectionCardsProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-400">
          Choose your role
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          How will you participate in Alpha?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Select one or more roles. You can participate
          in Alpha in multiple ways using one account.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {entrepreneurRoleOptions.map((option) => {
          const selected =
            selectedRoles.includes(option.key);

          const Icon = option.icon;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                onToggleRole(option.key)
              }
              className={[
                "relative rounded-2xl border p-4 text-left transition",
                selected
                  ? "border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10"
                  : "border-white/10 bg-slate-950/70 hover:border-white/25 hover:bg-slate-900",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    selected
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-white/5 text-slate-300",
                  ].join(" ")}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-white">
                      {option.title}
                    </h3>

                    <span
                      className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        selected
                          ? "border-emerald-400 bg-emerald-400 text-slate-950"
                          : "border-white/20 text-transparent",
                      ].join(" ")}
                    >
                      <Check size={14} />
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-5 text-slate-400">
                    {option.description}
                  </p>

                  {option.onboardingRequired && (
                    <p className="mt-2 text-xs font-semibold text-amber-300">
                      Additional profile verification
                      required
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRoles.length > 1 && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4">
          <label
            htmlFor="primaryRole"
            className="block text-sm font-bold text-blue-200"
          >
            Default workspace
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            This workspace will be selected by default
            when you sign in.
          </p>

          <select
            id="primaryRole"
            value={primaryRole}
            onChange={(event) =>
              onPrimaryRoleChange(
                event.target.value as EntrepreneurRole
              )
            }
            className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-blue-400"
          >
            {selectedRoles.map((role) => {
              const option =
                entrepreneurRoleOptions.find(
                  (item) => item.key === role
                );

              return (
                <option key={role} value={role}>
                  {option?.title ?? role}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </section>
  );
}