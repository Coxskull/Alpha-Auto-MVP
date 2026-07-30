"use client";

import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Store,
  Upload,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  getDashboardRoute,
  getPrimaryRole,
  getRoleTitle,
  getUserRoles,
  normalizeRole,
} from "@/app/lib/entrepreneurRoles";
import api from "@/services/api";
import type { AuthenticatedUser } from "@/types/entrepreneur";

type VerificationRole = "driver" | "mechanic" | "supplier";

type VerificationStatus =
  | "draft"
  | "pending"
  | "profile_incomplete"
  | "under_review"
  | "approved"
  | "active"
  | "rejected"
  | "needs_more_information";

type DocumentVerificationStatus =
  | "pending"
  | "accepted"
  | "rejected";

type RoleStatusResponse = {
  role?: string;
  Role?: string;
  roleKey?: string;
  RoleKey?: string;
  status?: string;
  Status?: string;
};

type VerificationDocument = {
  id: string;
  documentType: string;
  originalFileName: string;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  verificationStatus?: DocumentVerificationStatus;
  reviewerNotes?: string | null;
  uploadedAt?: string | null;
};

type VerificationApplication = {
  id: string;
  roleKey: VerificationRole;
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

  documents?: VerificationDocument[];
};

type VerificationFormState = {
  legalName: string;
  businessName: string;
  identificationNumber: string;
  licenseNumber: string;
  vehiclePlateNumber: string;
  yearsOfExperience: string;
  businessAddress: string;
  applicantNotes: string;
};

type DocumentRequirement = {
  type: string;
  label: string;
  description: string;
};

type RoleConfig = {
  title: string;
  description: string;
  documents: DocumentRequirement[];
};

type AuthenticatedUserWithStatuses = AuthenticatedUser & {
  roles?: string[];
  Roles?: string[];

  roleStatuses?: RoleStatusResponse[];
  RoleStatuses?: RoleStatusResponse[];

  fullName?: string;
  FullName?: string;

  nextStep?: string;
  NextStep?: string;
};

const verificationRoles: VerificationRole[] = [
  "driver",
  "mechanic",
  "supplier",
];

const emptyForm: VerificationFormState = {
  legalName: "",
  businessName: "",
  identificationNumber: "",
  licenseNumber: "",
  vehiclePlateNumber: "",
  yearsOfExperience: "",
  businessAddress: "",
  applicantNotes: "",
};

const roleConfiguration: Record<VerificationRole, RoleConfig> = {
  driver: {
    title: "Driver Verification",
    description:
      "Verify your identity, driving authorization, and delivery vehicle before accepting Alpha delivery jobs.",
    documents: [
      {
        type: "government_id",
        label: "Government-issued ID",
        description:
          "Upload a clear photo or PDF of a valid government-issued identification document.",
      },
      {
        type: "drivers_license",
        label: "Driver’s License",
        description:
          "Upload a clear image or PDF of your valid driver’s license.",
      },
      {
        type: "vehicle_registration",
        label: "Vehicle Registration",
        description:
          "Upload your OR/CR, vehicle registration, or equivalent ownership document.",
      },
      {
        type: "vehicle_photo",
        label: "Vehicle Photo",
        description:
          "Upload a recent photo showing the vehicle and visible plate number.",
      },
      {
        type: "selfie_with_id",
        label: "Selfie Holding ID",
        description:
          "Upload a clear selfie while holding the same government-issued ID.",
      },
    ],
  },

  mechanic: {
    title: "Mechanic Verification",
    description:
      "Verify your identity, work experience, and ability to provide legitimate automotive repair services.",
    documents: [
      {
        type: "government_id",
        label: "Government-issued ID",
        description:
          "Upload a clear photo or PDF of a valid government-issued identification document.",
      },
      {
        type: "workplace_photo",
        label: "Workplace Photo",
        description:
          "Upload a recent photo of your workshop, service area, or current workplace.",
      },
      {
        type: "professional_proof",
        label: "Professional Proof",
        description:
          "Upload a certificate, training record, employment proof, business permit, or similar proof.",
      },
      {
        type: "selfie_with_id",
        label: "Selfie Holding ID",
        description:
          "Upload a clear selfie while holding the same government-issued ID.",
      },
    ],
  },

  supplier: {
    title: "Supplier Verification",
    description:
      "Verify your identity and auto-parts business before listing products and receiving Alpha orders.",
    documents: [
      {
        type: "government_id",
        label: "Owner or Representative ID",
        description:
          "Upload the government-issued ID of the owner or authorized representative.",
      },
      {
        type: "business_registration",
        label: "Business Registration",
        description:
          "Upload a DTI, SEC, business permit, or equivalent registration document.",
      },
      {
        type: "storefront_photo",
        label: "Storefront Photo",
        description:
          "Upload a recent photo of your store, warehouse, or operating location.",
      },
      {
        type: "business_address_proof",
        label: "Business Address Proof",
        description:
          "Upload a utility bill, lease, permit, or another document showing the business address.",
      },
    ],
  },
};

function normalizeStatus(value?: string | null): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_") ?? ""
  );
}

function safeNormalizeRole(value?: string | null): string {
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

function isVerificationRole(
  role?: string | null
): role is VerificationRole {
  return verificationRoles.includes(
    safeNormalizeRole(role) as VerificationRole
  );
}

function getSafeUserRoles(
  user?: AuthenticatedUserWithStatuses | null
): string[] {
  if (!user) {
    return [];
  }

  try {
    const resolved = getUserRoles(user);

    if (Array.isArray(resolved)) {
      return resolved
        .map((role) => safeNormalizeRole(role))
        .filter(Boolean);
    }
  } catch {
    // Fall through to direct role arrays.
  }

  const directRoles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.Roles)
      ? user.Roles
      : [];

  return directRoles
    .map((role) => safeNormalizeRole(role))
    .filter(Boolean);
}

function parseRoleStatuses(
  user?: AuthenticatedUserWithStatuses | null
): Array<{ role: string; status: string }> {
  if (!user) {
    return [];
  }

  const source = Array.isArray(user.roleStatuses)
    ? user.roleStatuses
    : Array.isArray(user.RoleStatuses)
      ? user.RoleStatuses
      : [];

  return source
    .map((item) => ({
      role: safeNormalizeRole(
        item?.role ??
          item?.Role ??
          item?.roleKey ??
          item?.RoleKey
      ),
      status: normalizeStatus(item?.status ?? item?.Status),
    }))
    .filter((item) => Boolean(item.role) && Boolean(item.status));
}

function getApplicationsFromResponse(
  data: unknown
): VerificationApplication[] {
  if (Array.isArray(data)) {
    return data as VerificationApplication[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const response = data as {
    applications?: unknown;
    items?: unknown;
    data?: unknown;
    result?: unknown;
  };

  if (Array.isArray(response.applications)) {
    return response.applications as VerificationApplication[];
  }

  if (Array.isArray(response.items)) {
    return response.items as VerificationApplication[];
  }

  if (Array.isArray(response.data)) {
    return response.data as VerificationApplication[];
  }

  if (Array.isArray(response.result)) {
    return response.result as VerificationApplication[];
  }

  return [];
}

function getDocuments(
  application?: VerificationApplication
): VerificationDocument[] {
  return Array.isArray(application?.documents)
    ? application.documents
    : [];
}

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

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return fallback;
}

function formatFileSize(value?: number | null): string {
  if (!value || value <= 0) {
    return "";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatusDetails(status?: string): {
  label: string;
  classes: string;
  icon: typeof Clock3;
} {
  switch (normalizeStatus(status)) {
    case "approved":
    case "active":
      return {
        label: "Approved",
        classes:
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        icon: CheckCircle2,
      };

    case "under_review":
      return {
        label: "Under Review",
        classes:
          "border-amber-400/30 bg-amber-400/10 text-amber-200",
        icon: Clock3,
      };

    case "rejected":
      return {
        label: "Rejected",
        classes:
          "border-red-400/30 bg-red-400/10 text-red-300",
        icon: XCircle,
      };

    case "needs_more_information":
      return {
        label: "More Information Needed",
        classes:
          "border-orange-400/30 bg-orange-400/10 text-orange-200",
        icon: AlertCircle,
      };

    case "draft":
      return {
        label: "Draft",
        classes:
          "border-blue-400/30 bg-blue-400/10 text-blue-200",
        icon: FileText,
      };

    case "pending":
      return {
        label: "Pending",
        classes:
          "border-slate-400/30 bg-slate-400/10 text-slate-300",
        icon: Clock3,
      };

    default:
      return {
        label: "Not Submitted",
        classes:
          "border-slate-400/30 bg-slate-400/10 text-slate-300",
        icon: FileText,
      };
  }
}

function getRoleIcon(role: VerificationRole) {
  switch (role) {
    case "driver":
      return Bike;
    case "mechanic":
      return Wrench;
    case "supplier":
      return Store;
  }
}

function applicationToForm(
  application: VerificationApplication | undefined,
  user: AuthenticatedUserWithStatuses | null
): VerificationFormState {
  return {
    legalName:
      application?.legalName ??
      user?.fullName ??
      user?.FullName ??
      "",
    businessName: application?.businessName ?? "",
    identificationNumber:
      application?.identificationNumber ?? "",
    licenseNumber: application?.licenseNumber ?? "",
    vehiclePlateNumber:
      application?.vehiclePlateNumber ?? "",
    yearsOfExperience:
      application?.yearsOfExperience != null
        ? String(application.yearsOfExperience)
        : "",
    businessAddress: application?.businessAddress ?? "",
    applicantNotes: application?.applicantNotes ?? "",
  };
}

function isReadOnlyStatus(status?: string): boolean {
  const normalized = normalizeStatus(status);

  return (
    normalized === "under_review" ||
    normalized === "approved" ||
    normalized === "active"
  );
}

function clearAuthentication() {
  localStorage.removeItem("alpha_token");
  localStorage.removeItem("alpha_user");
  localStorage.removeItem("supplierId");
  localStorage.removeItem("driverId");
  localStorage.removeItem("mechanicId");
}

export default function VerificationPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<AuthenticatedUserWithStatuses | null>(null);

  const [roleStatuses, setRoleStatuses] = useState<
    Array<{ role: string; status: string }>
  >([]);

  const [applications, setApplications] = useState<
    VerificationApplication[]
  >([]);

  const [selectedRole, setSelectedRole] =
    useState<VerificationRole | null>(null);

  const [form, setForm] =
    useState<VerificationFormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [uploadingDocument, setUploadingDocument] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const safeApplications = useMemo(
    () => (Array.isArray(applications) ? applications : []),
    [applications]
  );

  const safeRoleStatuses = useMemo(
    () => (Array.isArray(roleStatuses) ? roleStatuses : []),
    [roleStatuses]
  );

  const selectedApplication = useMemo(() => {
    if (!selectedRole) {
      return undefined;
    }

    return safeApplications.find(
      (application) =>
        safeNormalizeRole(application?.roleKey) === selectedRole
    );
  }, [safeApplications, selectedRole]);

  const availableRoles = useMemo(() => {
    const rolesFromStatuses = safeRoleStatuses
      .map((item) => item?.role)
      .filter(isVerificationRole);

    const rolesFromApplications = safeApplications
      .map((application) =>
        safeNormalizeRole(application?.roleKey)
      )
      .filter(isVerificationRole);

    const rolesFromUser = getSafeUserRoles(user)
      .map((role) => safeNormalizeRole(role))
      .filter(isVerificationRole);

    return Array.from(
      new Set([
        ...rolesFromStatuses,
        ...rolesFromApplications,
        ...rolesFromUser,
      ])
    ) as VerificationRole[];
  }, [safeApplications, safeRoleStatuses, user]);

  const currentRoleStatus = useMemo(() => {
    if (!selectedRole) {
      return "profile_incomplete";
    }

    if (selectedApplication?.status) {
      return normalizeStatus(selectedApplication.status);
    }

    return (
      safeRoleStatuses.find(
        (item) => item?.role === selectedRole
      )?.status ?? "profile_incomplete"
    );
  }, [
    safeRoleStatuses,
    selectedApplication,
    selectedRole,
  ]);

  const selectedConfig = selectedRole
    ? roleConfiguration[selectedRole]
    : null;

  const readOnly = isReadOnlyStatus(currentRoleStatus);

  const refreshApplications = useCallback(
    async (
      currentUser: AuthenticatedUserWithStatuses | null = user,
      currentRole: VerificationRole | null = selectedRole
    ) => {
      const response = await api.get(
        "/api/role-verifications/mine"
      );

      const loaded = getApplicationsFromResponse(response.data);

      setApplications(loaded);

      if (currentRole) {
        const application = loaded.find(
          (item) =>
            safeNormalizeRole(item?.roleKey) === currentRole
        );

        if (application) {
          setForm(applicationToForm(application, currentUser));
        }
      }

      return loaded;
    },
    [selectedRole, user]
  );

  const loadVerificationData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("alpha_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const [userResponse, applicationsResponse] =
        await Promise.all([
          api.get("/api/Auth/me"),
          api.get("/api/role-verifications/mine"),
        ]);

      const authenticatedUser =
        userResponse.data as AuthenticatedUserWithStatuses;

      const loadedApplications = getApplicationsFromResponse(
        applicationsResponse.data
      );

      const parsedStatuses =
        parseRoleStatuses(authenticatedUser);

      setUser(authenticatedUser);
      setRoleStatuses(parsedStatuses);
      setApplications(loadedApplications);

      localStorage.setItem(
        "alpha_user",
        JSON.stringify({
          ...authenticatedUser,
          roleStatuses: parsedStatuses,
        })
      );

      const firstPendingRole = parsedStatuses.find(
        (item) =>
          isVerificationRole(item?.role) &&
          !["approved", "active"].includes(
            normalizeStatus(item?.status)
          )
      )?.role;

      const firstApplicationRole = loadedApplications.find(
        (application) =>
          !["approved", "active"].includes(
            normalizeStatus(application?.status)
          )
      )?.roleKey;

      const firstOperationalRole = getSafeUserRoles(
        authenticatedUser
      ).find(isVerificationRole);

      const firstAvailableRole =
        firstPendingRole ??
        firstApplicationRole ??
        firstOperationalRole ??
        loadedApplications[0]?.roleKey ??
        null;

      if (
        firstAvailableRole &&
        isVerificationRole(firstAvailableRole)
      ) {
        setSelectedRole(firstAvailableRole);

        const application = loadedApplications.find(
          (item) =>
            safeNormalizeRole(item?.roleKey) ===
            firstAvailableRole
        );

        setForm(
          applicationToForm(application, authenticatedUser)
        );
      }
    } catch (requestError: unknown) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        clearAuthentication();
        router.replace("/login");
        return;
      }

      setError(
        getErrorMessage(
          requestError,
          "Unable to load your verification information."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

 useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadVerificationData();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadVerificationData]);

  function selectRole(role: VerificationRole) {
    setSelectedRole(role);
    setError("");
    setMessage("");

    const application = safeApplications.find(
      (item) =>
        safeNormalizeRole(item?.roleKey) === role
    );

    setForm(applicationToForm(application, user));
  }

  function updateField(
    field: keyof VerificationFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveApplication(
    event?: FormEvent<HTMLFormElement>
  ): Promise<VerificationApplication | null> {
    event?.preventDefault();

    if (!selectedRole) {
      setError("Select a role to verify.");
      return null;
    }

    if (!form.legalName.trim()) {
      setError("Enter your complete legal name.");
      return null;
    }

    if (
      selectedRole === "supplier" &&
      !form.businessName.trim()
    ) {
      setError("Enter the supplier business name.");
      return null;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        "/api/role-verifications",
        {
          roleKey: selectedRole,
          legalName: form.legalName.trim(),
          businessName:
            form.businessName.trim() || null,
          identificationNumber:
            form.identificationNumber.trim() || null,
          licenseNumber:
            form.licenseNumber.trim() || null,
          vehiclePlateNumber:
            form.vehiclePlateNumber.trim() || null,
          yearsOfExperience:
            form.yearsOfExperience.trim() !== ""
              ? Number(form.yearsOfExperience)
              : null,
          businessAddress:
            form.businessAddress.trim() || null,
          applicantNotes:
            form.applicantNotes.trim() || null,
        }
      );

      const applicationId =
        response.data?.id ??
        response.data?.Id ??
        response.data?.applicationId ??
        response.data?.ApplicationId;

      if (!applicationId) {
        throw new Error(
          "The server did not return an application ID."
        );
      }

      const loaded = await refreshApplications(
        user,
        selectedRole
      );

      const refreshed = loaded.find(
        (application) =>
          String(application.id) === String(applicationId)
      );

      setMessage("Verification information saved.");

      return (
        refreshed ?? {
          id: String(applicationId),
          roleKey: selectedRole,
          status:
            response.data?.status ??
            response.data?.Status ??
            "draft",
          legalName: form.legalName.trim(),
          businessName:
            form.businessName.trim() || null,
          identificationNumber:
            form.identificationNumber.trim() || null,
          licenseNumber:
            form.licenseNumber.trim() || null,
          vehiclePlateNumber:
            form.vehiclePlateNumber.trim() || null,
          yearsOfExperience:
            form.yearsOfExperience.trim() !== ""
              ? Number(form.yearsOfExperience)
              : null,
          businessAddress:
            form.businessAddress.trim() || null,
          applicantNotes:
            form.applicantNotes.trim() || null,
          documents: getDocuments(selectedApplication),
        }
      );
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to save the verification application."
        )
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  async function ensureApplication():
    Promise<VerificationApplication | null> {
    if (selectedApplication) {
      return selectedApplication;
    }

    return saveApplication();
  }

  async function uploadDocument(
    requirement: DocumentRequirement,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP, and PDF files are allowed."
      );
      return;
    }

    const maximumFileSize = 10 * 1024 * 1024;

    if (file.size > maximumFileSize) {
      setError("The maximum file size is 10 MB.");
      return;
    }

    setUploadingDocument(requirement.type);
    setError("");
    setMessage("");

    try {
      const application = await ensureApplication();

      if (!application) {
        return;
      }

      const formData = new FormData();
      formData.append("documentType", requirement.type);
      formData.append("file", file);

      await api.post(
        `/api/role-verifications/${application.id}/documents`,
        formData
      );

      await refreshApplications(user, selectedRole);

      setMessage(
        `${requirement.label} uploaded successfully.`
      );
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          `Unable to upload ${requirement.label}.`
        )
      );
    } finally {
      setUploadingDocument(null);
    }
  }

  async function submitApplication() {
    if (!selectedRole) {
      setError("Select a role to verify.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      let application = selectedApplication;

      if (!application) {
        application =
          (await saveApplication()) ?? undefined;
      }

      if (!application) {
        return;
      }

      const requirements =
        roleConfiguration[selectedRole].documents;

      const uploadedDocuments =
        getDocuments(application);

      const missingDocuments = requirements.filter(
        (requirement) =>
          !uploadedDocuments.some(
            (document) =>
              document?.documentType === requirement.type
          )
      );

      if (missingDocuments.length > 0) {
        setError(
          `Upload all required documents before submitting: ${missingDocuments
            .map((requirement) => requirement.label)
            .join(", ")}.`
        );
        return;
      }

      await api.post(
        `/api/role-verifications/${application.id}/submit`
      );

      await loadVerificationData();

      setMessage(
        "Your verification application was submitted successfully."
      );
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to submit the verification application."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  function signOut() {
    clearAuthentication();
    router.replace("/login");
  }

  function continueToWorkspace() {
    if (!user) {
      router.push("/");
      return;
    }

    const statuses = parseRoleStatuses(user);

    const activeRoles = statuses
      .filter((item) => item.status === "active")
      .map((item) => item.role);

    const fallbackRoles = getSafeUserRoles(user);

    const usableRoles =
      activeRoles.length > 0
        ? activeRoles
        : fallbackRoles.filter(
            (role) =>
              !verificationRoles.includes(
                safeNormalizeRole(role) as VerificationRole
              )
          );

    if (usableRoles.length > 1) {
      router.push("/select-workspace");
      return;
    }

    const targetRole =
      usableRoles[0] ??
      safeNormalizeRole(getPrimaryRole(user));

    router.push(getDashboardRoute(targetRole));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-11 w-11 animate-spin text-emerald-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading verification...
          </p>
        </div>
      </main>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl">
          <ShieldCheck className="mx-auto h-14 w-14 text-emerald-400" />

          <h1 className="mt-5 text-3xl font-bold">
            No Verification Required
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Your account does not currently have a driver,
            mechanic, or supplier role that requires verification.
          </p>

          <button
            type="button"
            onClick={continueToWorkspace}
            className="mt-7 rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            Continue to Alpha
          </button>
        </div>
      </main>
    );
  }

  const allRolesApproved = availableRoles.every((role) => {
    const application = safeApplications.find(
      (item) =>
        safeNormalizeRole(item?.roleKey) === role
    );

    const roleStatus = safeRoleStatuses.find(
      (item) => item?.role === role
    )?.status;

    return ["approved", "active"].includes(
      normalizeStatus(application?.status ?? roleStatus)
    );
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Alpha Entrepreneur Network
            </p>

            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              Account Verification
            </h1>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-400/40 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-slate-900 p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />

                <h2 className="text-2xl font-bold">
                  Help us keep Alpha safe
                </h2>
              </div>

              <p className="mt-3 leading-7 text-slate-300">
                Drivers, mechanics, and suppliers must submit
                legitimate documents before receiving jobs,
                accepting deliveries, or selling products.
              </p>
            </div>

            {allRolesApproved && (
              <button
                type="button"
                onClick={continueToWorkspace}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                <CheckCircle2 className="h-5 w-5" />
                Continue to Workspace
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-red-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm leading-6">{error}</p>
          </div>
        )}

        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm leading-6">{message}</p>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <h2 className="font-bold">Your Roles</h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Select a role to complete or review its verification.
              </p>

              <div className="mt-5 space-y-3">
                {availableRoles.map((role) => {
                  const RoleIcon = getRoleIcon(role);

                  const application = safeApplications.find(
                    (item) =>
                      safeNormalizeRole(item?.roleKey) === role
                  );

                  const roleStatus =
                    application?.status ??
                    safeRoleStatuses.find(
                      (item) => item?.role === role
                    )?.status ??
                    "profile_incomplete";

                  const statusDetails =
                    getStatusDetails(roleStatus);

                  const StatusIcon = statusDetails.icon;
                  const selected = selectedRole === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => selectRole(role)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-emerald-400 bg-emerald-400/10"
                          : "border-white/10 bg-slate-950 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white/5 p-2.5">
                          <RoleIcon className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {getRoleTitle(role)}
                          </p>

                          <div
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusDetails.classes}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusDetails.label}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <h3 className="font-bold">File Requirements</h3>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                <li>JPG, PNG, WEBP, or PDF only</li>
                <li>Maximum file size: 10 MB</li>
                <li>Documents must be readable</li>
                <li>Do not upload altered documents</li>
              </ul>
            </div>
          </aside>

          <section>
            {!selectedRole || !selectedConfig ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-slate-500" />

                <p className="mt-4 text-slate-400">
                  Select a role to begin verification.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedConfig.title}
                      </h2>

                      <p className="mt-2 max-w-3xl leading-7 text-slate-400">
                        {selectedConfig.description}
                      </p>
                    </div>

                    {(() => {
                      const details =
                        getStatusDetails(currentRoleStatus);

                      const StatusIcon = details.icon;

                      return (
                        <div
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${details.classes}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {details.label}
                        </div>
                      );
                    })()}
                  </div>

                  {currentRoleStatus === "under_review" && (
                    <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                      Your documents are awaiting administrator
                      review. Editing is disabled while the
                      application is under review.
                    </div>
                  )}

                  {["approved", "active"].includes(
                    currentRoleStatus
                  ) && (
                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
                      This role has been verified and approved.
                    </div>
                  )}

                  {currentRoleStatus === "rejected" && (
                    <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">
                      <p className="font-bold">
                        Verification rejected
                      </p>

                      <p className="mt-1">
                        {selectedApplication?.rejectionReason ??
                          "Review your information and documents before submitting again."}
                      </p>
                    </div>
                  )}

                  {currentRoleStatus ===
                    "needs_more_information" && (
                    <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4 text-sm leading-6 text-orange-100">
                      <p className="font-bold">
                        More information is required
                      </p>

                      <p className="mt-1">
                        {selectedApplication?.reviewerNotes ??
                          "Update the requested information or documents and resubmit."}
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={(event) =>
                      void saveApplication(event)
                    }
                    className="mt-7"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-200">
                          Complete Legal Name
                          <span className="text-red-400"> *</span>
                        </span>

                        <input
                          type="text"
                          value={form.legalName}
                          onChange={(event) =>
                            updateField(
                              "legalName",
                              event.target.value
                            )
                          }
                          disabled={readOnly}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>

                      {selectedRole === "supplier" && (
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-200">
                            Business Name
                            <span className="text-red-400">
                              {" "}
                              *
                            </span>
                          </span>

                          <input
                            type="text"
                            value={form.businessName}
                            onChange={(event) =>
                              updateField(
                                "businessName",
                                event.target.value
                              )
                            }
                            disabled={readOnly}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </label>
                      )}

                      <label className="block">
                        <span className="text-sm font-semibold text-slate-200">
                          Identification Number
                        </span>

                        <input
                          type="text"
                          value={form.identificationNumber}
                          onChange={(event) =>
                            updateField(
                              "identificationNumber",
                              event.target.value
                            )
                          }
                          disabled={readOnly}
                          placeholder="Optional document reference"
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>

                      {selectedRole === "driver" && (
                        <>
                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">
                              Driver’s License Number
                            </span>

                            <input
                              type="text"
                              value={form.licenseNumber}
                              onChange={(event) =>
                                updateField(
                                  "licenseNumber",
                                  event.target.value
                                )
                              }
                              disabled={readOnly}
                              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </label>

                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">
                              Vehicle Plate Number
                            </span>

                            <input
                              type="text"
                              value={form.vehiclePlateNumber}
                              onChange={(event) =>
                                updateField(
                                  "vehiclePlateNumber",
                                  event.target.value
                                )
                              }
                              disabled={readOnly}
                              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 uppercase outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </label>
                        </>
                      )}

                      {(selectedRole === "mechanic" ||
                        selectedRole === "supplier") && (
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-200">
                            Years of Experience
                          </span>

                          <input
                            type="number"
                            min="0"
                            max="80"
                            value={form.yearsOfExperience}
                            onChange={(event) =>
                              updateField(
                                "yearsOfExperience",
                                event.target.value
                              )
                            }
                            disabled={readOnly}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </label>
                      )}

                      <label className="block md:col-span-2">
                        <span className="text-sm font-semibold text-slate-200">
                          {selectedRole === "supplier"
                            ? "Business Address"
                            : "Work or Service Address"}
                        </span>

                        <textarea
                          rows={3}
                          value={form.businessAddress}
                          onChange={(event) =>
                            updateField(
                              "businessAddress",
                              event.target.value
                            )
                          }
                          disabled={readOnly}
                          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="text-sm font-semibold text-slate-200">
                          Additional Information
                        </span>

                        <textarea
                          rows={4}
                          value={form.applicantNotes}
                          onChange={(event) =>
                            updateField(
                              "applicantNotes",
                              event.target.value
                            )
                          }
                          disabled={readOnly}
                          placeholder="Tell Alpha about your experience, services, vehicle, or business."
                          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>
                    </div>

                    {!readOnly && (
                      <button
                        type="submit"
                        disabled={saving}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 font-bold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <FileCheck2 className="h-5 w-5" />
                        )}

                        {saving
                          ? "Saving..."
                          : "Save Information"}
                      </button>
                    )}
                  </form>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <Upload className="h-6 w-6 text-emerald-400" />

                    <div>
                      <h2 className="text-xl font-bold">
                        Required Documents
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Upload clear and current documents for
                        administrator review.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {selectedConfig.documents.map(
                      (requirement) => {
                        const document = getDocuments(
                          selectedApplication
                        ).find(
                          (item) =>
                            item?.documentType ===
                            requirement.type
                        );

                        const uploading =
                          uploadingDocument === requirement.type;

                        return (
                          <div
                            key={requirement.type}
                            className="rounded-2xl border border-white/10 bg-slate-950 p-5"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-white/5 p-2.5">
                                  {document ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold">
                                      {requirement.label}
                                    </h3>

                                    <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-xs font-semibold text-red-300">
                                      Required
                                    </span>
                                  </div>

                                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                                    {requirement.description}
                                  </p>

                                  {document && (
                                    <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-200">
                                      <p className="font-semibold">
                                        {document.originalFileName}
                                      </p>

                                      <p className="mt-0.5 text-xs text-emerald-300/70">
                                        {formatFileSize(
                                          document.fileSizeBytes
                                        )}

                                        {document.uploadedAt
                                          ? ` • Uploaded ${formatDate(
                                              document.uploadedAt
                                            )}`
                                          : ""}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {!readOnly && (
                                <label
                                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                                    uploading
                                      ? "cursor-not-allowed bg-slate-700 text-slate-400"
                                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                                  }`}
                                >
                                  {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}

                                  {uploading
                                    ? "Uploading..."
                                    : document
                                      ? "Replace"
                                      : "Upload"}

                                  <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                                    disabled={uploading}
                                    onChange={(event) =>
                                      void uploadDocument(
                                        requirement,
                                        event
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold">
                        Ready for review?
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Check your information and files carefully.
                        Editing is disabled while your application is
                        under review.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void submitApplication()
                      }
                      disabled={
                        submitting ||
                        saving ||
                        uploadingDocument !== null
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}

                      {submitting
                        ? "Submitting..."
                        : "Submit for Review"}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      void loadVerificationData()
                    }
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-60"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Status
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}