"use client";

import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import api from "@/services/api";

type VerificationStatus =
  | "draft"
  | "profile_incomplete"
  | "under_review"
  | "needs_more_information"
  | "approved"
  | "active"
  | "rejected";

type DocumentStatus =
  | "pending"
  | "accepted"
  | "rejected";

type Applicant = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
};

type VerificationDocument = {
  id: string;
  documentType: string;
  originalFileName: string;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  verificationStatus: DocumentStatus;
  reviewerNotes?: string | null;
  reviewedAt?: string | null;
  uploadedAt?: string | null;
};

type VerificationApplicationSummary = {
  id: string;
  userId: string;
  roleKey: string;
  status: VerificationStatus;

  legalName?: string | null;
  businessName?: string | null;

  applicant?: Applicant | null;

  documentCount: number;
  acceptedDocumentCount: number;
  rejectedDocumentCount: number;
  pendingDocumentCount: number;

  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type VerificationApplicationDetails = {
  id: string;
  userId: string;
  roleKey: string;
  status: VerificationStatus;

  legalName?: string | null;
  businessName?: string | null;
  identificationNumber?: string | null;
  licenseNumber?: string | null;
  vehiclePlateNumber?: string | null;
  yearsOfExperience?: number | null;
  businessAddress?: string | null;

  applicantNotes?: string | null;
  reviewerNotes?: string | null;
  rejectionReason?: string | null;

  submittedAt?: string | null;
  reviewedAt?: string | null;

  applicant?: Applicant | null;
  documents?: VerificationDocument[];
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getRoleTitle(role: string): string {
  switch (role) {
    case "driver":
      return "Driver";

    case "mechanic":
      return "Mechanic";

    case "supplier":
      return "Auto Parts Supplier";

    default:
      return role;
  }
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "active":
    case "approved":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

    case "under_review":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";

    case "needs_more_information":
      return "border-orange-400/30 bg-orange-400/10 text-orange-200";

    case "rejected":
      return "border-red-400/30 bg-red-400/10 text-red-300";

    default:
      return "border-slate-400/30 bg-slate-400/10 text-slate-300";
  }
}

export default function AdminVerificationsPage() {
  const [applications, setApplications] =
    useState<VerificationApplicationSummary[]>([]);

  const [selectedApplication, setSelectedApplication] =
    useState<VerificationApplicationDetails | null>(
      null
    );

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [openingDocument, setOpeningDocument] =
    useState<string | null>(null);

  const [statusFilter, setStatusFilter] =
    useState("under_review");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [reviewerNotes, setReviewerNotes] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (roleFilter) {
        params.set("role", roleFilter);
      }

      const query = params.toString();

      const response = await api.get(
        `/api/admin/role-verifications${
          query ? `?${query}` : ""
        }`
      );

      setApplications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to load verification applications."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadApplications();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return applications;
    }

    return applications.filter((application) => {
      const values = [
        application.legalName,
        application.businessName,
        application.roleKey,
        application.applicant?.fullName,
        application.applicant?.email,
      ];

      return values.some((value) =>
        value
          ?.toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [applications, searchText]);

  async function openApplication(id: string) {
    setLoadingDetails(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get(
        `/api/admin/role-verifications/${id}`
      );

      setSelectedApplication(response.data);

      setReviewerNotes(
        response.data?.reviewerNotes ?? ""
      );
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to load verification details."
        )
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  async function refreshSelectedApplication() {
    if (!selectedApplication) {
      return;
    }

    await openApplication(
      selectedApplication.id
    );

    await loadApplications();
  }

  async function openDocument(
  document: VerificationDocument
) {
  setOpeningDocument(document.id);
  setError("");

  try {
    const response = await api.get(
      `/api/admin/role-verifications/documents/${document.id}/file`,
      {
        responseType: "blob",
      }
    );

    const rawContentType =
      response.headers["content-type"];

    const headerContentType =
      typeof rawContentType === "string"
        ? rawContentType
        : null;

    const contentType =
      headerContentType?.trim() ||
      document.contentType?.trim() ||
      "application/octet-stream";

    const blob =
      response.data instanceof Blob
        ? response.data.slice(
            0,
            response.data.size,
            contentType
          )
        : new Blob([response.data], {
            type: contentType,
          });

    const objectUrl =
      URL.createObjectURL(blob);

    const newWindow = window.open(
      objectUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {
      URL.revokeObjectURL(objectUrl);

      setError(
        "The browser blocked the document preview. Allow pop-ups for this website and try again."
      );

      return;
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 60_000);
  } catch (requestError: unknown) {
    setError(
      getErrorMessage(
        requestError,
        "Unable to open the document."
      )
    );
  } finally {
    setOpeningDocument(null);
  }
}

  async function reviewDocument(
    documentId: string,
    status: "accepted" | "rejected"
  ) {
    const notes =
      status === "rejected"
        ? window.prompt(
            "Why is this document rejected?"
          )
        : window.prompt(
            "Optional review note:"
          );

    if (status === "rejected" && !notes?.trim()) {
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      await api.post(
        `/api/admin/role-verifications/documents/${documentId}/review`,
        {
          status,
          reviewerNotes:
            notes?.trim() || null,
        }
      );

      setMessage(
        `Document marked as ${status}.`
      );

      await refreshSelectedApplication();
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to review the document."
        )
      );
    } finally {
      setProcessing(false);
    }
  }

  async function approveApplication() {
    if (!selectedApplication) {
      return;
    }

    const confirmed = window.confirm(
      "Approve this application and activate the user role?"
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      await api.post(
        `/api/admin/role-verifications/${selectedApplication.id}/approve`,
        {
          reviewerNotes:
            reviewerNotes.trim() || null,
        }
      );

      setMessage(
        "Application approved and role activated."
      );

      setSelectedApplication(null);

      await loadApplications();
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to approve the application."
        )
      );
    } finally {
      setProcessing(false);
    }
  }

  async function requestMoreInformation() {
    if (!selectedApplication) {
      return;
    }

    if (!reviewerNotes.trim()) {
      setError(
        "Enter the additional information the applicant must provide."
      );

      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      await api.post(
        `/api/admin/role-verifications/${selectedApplication.id}/request-more-information`,
        {
          reviewerNotes:
            reviewerNotes.trim(),
        }
      );

      setMessage(
        "The applicant was asked to provide more information."
      );

      setSelectedApplication(null);

      await loadApplications();
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to request additional information."
        )
      );
    } finally {
      setProcessing(false);
    }
  }

  async function rejectApplication() {
    if (!selectedApplication) {
      return;
    }

    const reason = window.prompt(
      "Enter the reason for rejecting this application:"
    );

    if (!reason?.trim()) {
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      await api.post(
        `/api/admin/role-verifications/${selectedApplication.id}/reject`,
        {
          reason: reason.trim(),
          reviewerNotes:
            reviewerNotes.trim() || null,
        }
      );

      setMessage(
        "Verification application rejected."
      );

      setSelectedApplication(null);

      await loadApplications();
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to reject the application."
        )
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <main className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-400">
                Mission Control
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Role Verifications
              </h1>

              <p className="mt-2 text-slate-400">
                Review identity, vehicle, professional,
                and business documents.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadApplications()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </header>

          {error && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {message}
            </div>
          )}

          <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

                <input
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value
                    )
                  }
                  placeholder="Search applicant..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 outline-none focus:border-emerald-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option value="">
                  All statuses
                </option>

                <option value="under_review">
                  Under review
                </option>

                <option value="needs_more_information">
                  More information needed
                </option>

                <option value="active">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option value="">
                  All roles
                </option>

                <option value="driver">
                  Driver
                </option>

                <option value="mechanic">
                  Mechanic
                </option>

                <option value="supplier">
                  Supplier
                </option>
              </select>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-3xl border border-white/10 bg-slate-900">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-bold">
                  Verification Queue
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {filteredApplications.length} application(s)
                </p>
              </div>

              <div className="max-h-[750px] overflow-y-auto p-3">
                {loading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-400" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    No applications found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplications.map(
                      (application) => (
                        <button
                          key={application.id}
                          type="button"
                          onClick={() =>
                            void openApplication(
                              application.id
                            )
                          }
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            selectedApplication?.id ===
                            application.id
                              ? "border-emerald-400 bg-emerald-400/10"
                              : "border-white/10 bg-slate-950 hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold">
                                {application.applicant
                                  ?.fullName ??
                                  application.legalName ??
                                  "Applicant"}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                {getRoleTitle(
                                  application.roleKey
                                )}
                              </p>
                            </div>

                            <span
                              className={`h-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                application.status
                              )}`}
                            >
                              {formatStatus(
                                application.status
                              )}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                              {
                                application.acceptedDocumentCount
                              }{" "}
                              accepted
                            </div>

                            <div className="rounded-lg bg-amber-400/10 p-2 text-amber-200">
                              {
                                application.pendingDocumentCount
                              }{" "}
                              pending
                            </div>

                            <div className="rounded-lg bg-red-400/10 p-2 text-red-300">
                              {
                                application.rejectedDocumentCount
                              }{" "}
                              rejected
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              {loadingDetails ? (
                <div className="flex min-h-[500px] items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
                </div>
              ) : !selectedApplication ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                  <ShieldCheck className="h-14 w-14 text-slate-600" />

                  <h2 className="mt-4 text-xl font-bold">
                    Select an application
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Choose an applicant from the queue.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedApplication.applicant
                          ?.fullName ??
                          selectedApplication.legalName}
                      </h2>

                      <p className="mt-1 text-slate-400">
                        {getRoleTitle(
                          selectedApplication.roleKey
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Submitted{" "}
                        {formatDate(
                          selectedApplication.submittedAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`h-fit rounded-full border px-3 py-2 text-sm font-semibold ${getStatusClasses(
                        selectedApplication.status
                      )}`}
                    >
                      {formatStatus(
                        selectedApplication.status
                      )}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <InfoCard
                      label="Legal Name"
                      value={
                        selectedApplication.legalName
                      }
                    />

                    <InfoCard
                      label="Email"
                      value={
                        selectedApplication.applicant
                          ?.email
                      }
                    />

                    <InfoCard
                      label="Phone"
                      value={
                        selectedApplication.applicant
                          ?.phone
                      }
                    />

                    <InfoCard
                      label="Business Name"
                      value={
                        selectedApplication.businessName
                      }
                    />

                    <InfoCard
                      label="ID Number"
                      value={
                        selectedApplication.identificationNumber
                      }
                    />

                    <InfoCard
                      label="License Number"
                      value={
                        selectedApplication.licenseNumber
                      }
                    />

                    <InfoCard
                      label="Vehicle Plate"
                      value={
                        selectedApplication.vehiclePlateNumber
                      }
                    />

                    <InfoCard
                      label="Experience"
                      value={
                        selectedApplication.yearsOfExperience !=
                        null
                          ? `${selectedApplication.yearsOfExperience} years`
                          : null
                      }
                    />
                  </div>

                  {selectedApplication.businessAddress && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Address
                      </p>

                      <p className="mt-2 text-slate-200">
                        {
                          selectedApplication.businessAddress
                        }
                      </p>
                    </div>
                  )}

                  {selectedApplication.applicantNotes && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Applicant Notes
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-slate-200">
                        {
                          selectedApplication.applicantNotes
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="text-lg font-bold">
                      Submitted Documents
                    </h3>

                    <div className="mt-4 space-y-3">
                      {(selectedApplication.documents ??
                        []).map((document) => (
                        <div
                          key={document.id}
                          className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <FileText className="mt-1 h-5 w-5 text-emerald-400" />

                              <div>
                                <p className="font-bold">
                                  {formatStatus(
                                    document.documentType
                                  )}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                  {
                                    document.originalFileName
                                  }
                                </p>

                                {document.reviewerNotes && (
                                  <p className="mt-2 text-sm text-amber-200">
                                    {
                                      document.reviewerNotes
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  document.verificationStatus
                                )}`}
                              >
                                {formatStatus(
                                  document.verificationStatus
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  void openDocument(
                                    document
                                  )
                                }
                                disabled={
                                  openingDocument ===
                                  document.id
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold hover:border-white/20"
                              >
                                {openingDocument ===
                                document.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}

                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void reviewDocument(
                                    document.id,
                                    "accepted"
                                  )
                                }
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/20"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Accept
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void reviewDocument(
                                    document.id,
                                    "rejected"
                                  )
                                }
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/20"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="mt-8 block">
                    <span className="text-sm font-bold">
                      Admin Review Notes
                    </span>

                    <textarea
                      rows={4}
                      value={reviewerNotes}
                      onChange={(event) =>
                        setReviewerNotes(
                          event.target.value
                        )
                      }
                      placeholder="Enter instructions, review comments, or reasons..."
                      className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
                    />
                  </label>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        void approveApplication()
                      }
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Approve and Activate
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void requestMoreInformation()
                      }
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400/10 px-5 py-3 font-bold text-amber-200 hover:bg-amber-400/20 disabled:opacity-60"
                    >
                      <Clock3 className="h-5 w-5" />
                      Request More Information
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void rejectApplication()
                      }
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-400/10 px-5 py-3 font-bold text-red-300 hover:bg-red-400/20 disabled:opacity-60"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject Application
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-slate-200">
        {value || "Not provided"}
      </p>
    </div>
  );
}