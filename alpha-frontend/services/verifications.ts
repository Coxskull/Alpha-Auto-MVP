import api from "./api";

export type VerificationRole =
  | "driver"
  | "mechanic"
  | "supplier";

export type VerificationApplicationInput = {
  roleKey: VerificationRole;
  legalName?: string;
  businessName?: string;
  identificationNumber?: string;
  licenseNumber?: string;
  vehiclePlateNumber?: string;
  yearsOfExperience?: number;
  businessAddress?: string;
  applicantNotes?: string;
};

export async function getMyVerifications() {
  const response = await api.get(
    "/api/role-verifications/mine"
  );

  return response.data;
}

export async function saveVerificationApplication(
  input: VerificationApplicationInput
) {
  const response = await api.post(
    "/api/role-verifications",
    input
  );

  return response.data;
}

export async function uploadVerificationDocument(
  applicationId: string,
  documentType: string,
  file: File
) {
  const formData = new FormData();

  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await api.post(
    `/api/role-verifications/${applicationId}/documents`,
    formData
  );

  return response.data;
}

export async function submitVerification(
  applicationId: string
) {
  const response = await api.post(
    `/api/role-verifications/${applicationId}/submit`
  );

  return response.data;
}

export async function getPendingVerifications() {
  const response = await api.get(
    "/api/role-verifications/admin/pending"
  );

  return response.data;
}

export async function reviewVerification(
  applicationId: string,
  decision:
    | "approved"
    | "rejected"
    | "needs_more_information",
  reviewerNotes?: string,
  rejectionReason?: string
) {
  const response = await api.post(
    `/api/role-verifications/admin/${applicationId}/review`,
    {
      decision,
      reviewerNotes,
      rejectionReason,
    }
  );

  return response.data;
}