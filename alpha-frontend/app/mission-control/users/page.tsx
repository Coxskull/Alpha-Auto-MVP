"use client";

import axios from "axios";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import api from "@/services/api";

type AlphaUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: string;
};

type CreateUserForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  territory: string;
  address: string;
  vehicleType: string;
  plateNumber: string;
};

const roles = [
  "admin",
  "dispatcher",
  "customer",
  "driver",
  "provider",
  "supplier",
  "mechanic",
  "tow_provider",
];

const initialForm: CreateUserForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
  territory: "",
  address: "",
  vehicleType: "",
  plateNumber: "",
};

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (typeof data === "string") {
    return data;
  }

  return fallback;
}

export default function UsersPage() {
  const [users, setUsers] =
    useState<AlphaUser[]>([]);

  const [form, setForm] =
    useState<CreateUserForm>(initialForm);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  async function loadUsers() {
  setLoading(true);
  setError("");

  try {
    const response = await api.get<AlphaUser[]>(
      "/api/Users",
      {
        params: {
          search: search.trim() || undefined,
          role: roleFilter || undefined,
        },
      }
    );

    setUsers(response.data);
  } catch (requestError: unknown) {
    if (
      axios.isAxiosError(requestError) &&
      requestError.response?.status === 403
    ) {
      setError(
        "Only administrators can manage accounts."
      );
    } else {
      setError("Unable to load user accounts.");
    }
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  let isCancelled = false;

  api
    .get<AlphaUser[]>("/api/Users", {
      params: {
        role: roleFilter || undefined,
      },
    })
    .then((response) => {
      if (!isCancelled) {
        setUsers(response.data);
      }
    })
    .catch((requestError: unknown) => {
      if (isCancelled) {
        return;
      }

      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 403
      ) {
        setError(
          "Only administrators can manage accounts."
        );
      } else {
        setError("Unable to load user accounts.");
      }
    })
    .finally(() => {
      if (!isCancelled) {
        setLoading(false);
      }
    });

  return () => {
    isCancelled = true;
  };
}, [roleFilter]);

  function updateForm(
    field: keyof CreateUserForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createAccount(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    setCreating(true);

    try {
      await api.post("/api/Users", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        role: form.role,
        territory: form.territory || null,
        address: form.address || null,
        vehicleType: form.vehicleType || null,
        plateNumber: form.plateNumber || null,
      });

      setForm(initialForm);
      setShowForm(false);
      setSuccess("Account created successfully.");

      await loadUsers();
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to create account."
        )
      );
    } finally {
      setCreating(false);
    }
  }

  async function resetPassword(user: AlphaUser) {
    const newPassword = window.prompt(
      `Enter a new password for ${user.fullName}.`
    );

    if (!newPassword) {
      return;
    }

    if (newPassword.length < 8) {
      window.alert(
        "Password must contain at least 8 characters."
      );

      return;
    }

    try {
      await api.post(
        `/api/Users/${user.id}/reset-password`,
        {
          newPassword,
        }
      );

      window.alert("Password updated successfully.");
    } catch (requestError: unknown) {
      window.alert(
        getErrorMessage(
          requestError,
          "Unable to reset the password."
        )
      );
    }
  }

  async function deleteAccount(user: AlphaUser) {
    const confirmed = window.confirm(
      `Delete the account for ${user.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/Users/${user.id}`);

      setSuccess("Account deleted successfully.");

      await loadUsers();
    } catch (requestError: unknown) {
      window.alert(
        getErrorMessage(
          requestError,
          "Unable to delete the account."
        )
      );
    }
  }

  const showSupplierFields =
    form.role === "supplier" ||
    form.role === "provider";

  const showDriverFields =
    form.role === "driver";

  const showTerritory =
    showSupplierFields ||
    showDriverFields ||
    form.role === "mechanic";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            User Accounts
          </h1>

          <p className="text-sm text-gray-400">
            Manage accounts for every Alpha role.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm((current) => !current)
          }
          className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-black"
        >
          {showForm ? "Close" : "Add Account"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createAccount}
          className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Full name
            </label>

            <input
              required
              value={form.fullName}
              onChange={(event) =>
                updateForm(
                  "fullName",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Email
            </label>

            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                updateForm("email", event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Phone
            </label>

            <input
              value={form.phone}
              onChange={(event) =>
                updateForm("phone", event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Temporary password
            </label>

            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) =>
                updateForm(
                  "password",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Role
            </label>

            <select
              value={form.role}
              onChange={(event) =>
                updateForm("role", event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {showTerritory && (
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Territory or service area
              </label>

              <input
                value={form.territory}
                onChange={(event) =>
                  updateForm(
                    "territory",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
              />
            </div>
          )}

          {showSupplierFields && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-gray-400">
                Supplier address
              </label>

              <input
                value={form.address}
                onChange={(event) =>
                  updateForm(
                    "address",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
              />
            </div>
          )}

          {showDriverFields && (
            <>
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Vehicle type
                </label>

                <input
                  value={form.vehicleType}
                  onChange={(event) =>
                    updateForm(
                      "vehicleType",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Plate number
                </label>

                <input
                  value={form.plateNumber}
                  onChange={(event) =>
                    updateForm(
                      "plateNumber",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-green-500 p-3 font-bold text-black md:col-span-2 disabled:opacity-60"
          >
            {creating
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void loadUsers();
            }
          }}
          placeholder="Search name or email"
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-slate-950 p-3 text-white"
        />

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(event.target.value)
          }
          className="rounded-xl border border-white/10 bg-slate-950 px-4 text-white"
        >
          <option value="">All roles</option>

          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void loadUsers()}
          className="rounded-xl border border-white/10 px-5 text-white"
        >
          Search
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl bg-green-500/10 p-3 text-green-400">
          {success}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5 text-left text-gray-400">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-white/5"
                >
                  <td className="p-4 font-medium text-white">
                    {user.fullName}
                  </td>

                  <td className="p-4 text-gray-300">
                    {user.email}
                  </td>

                  <td className="p-4 text-gray-300">
                    {user.phone || "—"}
                  </td>

                  <td className="p-4 capitalize text-gray-300">
                    {user.role.replaceAll("_", " ")}
                  </td>

                  <td className="p-4 text-gray-300">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="whitespace-nowrap p-4">
                    <button
                      type="button"
                      onClick={() =>
                        void resetPassword(user)
                      }
                      className="mr-4 text-green-400 hover:underline"
                    >
                      Reset password
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteAccount(user)
                      }
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <p className="p-6 text-gray-400">
            Loading accounts...
          </p>
        )}

        {!loading && users.length === 0 && (
          <p className="p-6 text-gray-400">
            No accounts found.
          </p>
        )}
      </div>
    </div>
  );
}