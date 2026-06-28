import api from "@/services/api";

export type ServiceRequestPayload = {
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  vehicleInfo?: string;
  issueDescription: string;
  serviceAddress: string;
  zone: string;
  finalAmount: number;
};

export async function createServiceRequest(data: ServiceRequestPayload) {
  const response = await api.post("/api/ServiceRequests", data);
  return response.data;
}

export async function getServiceRequests() {
  const response = await api.get("/api/ServiceRequests");
  return response.data;
}

export async function getServiceRequest(id: string) {
  const response = await api.get(`/api/ServiceRequests/${id}`);
  return response.data;
}

export async function getMyMechanicRequests() {
  const response = await api.get("/api/ServiceRequests/my-mechanic");
  return response.data;
}

export async function getMyDriverRequests() {
  const response = await api.get("/api/ServiceRequests/my-driver");
  return response.data;
}

export async function assignProvider(id: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/assign-provider`);
  return response.data;
}

export async function providerAccept(id: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/provider-accept`);
  return response.data;
}

export async function assignMechanic(id: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/assign-nearest-mechanic`);
  return response.data;
}

export async function mechanicAccept(id: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/mechanic-accept`);
  return response.data;
}

export async function requestParts(
  id: string,
  partDescription: string,
  notes?: string
) {
  const response = await api.post(`/api/ServiceRequests/${id}/request-parts`, {
    partDescription,
    notes,
  });

  return response.data;
}

export async function assignDriver(id: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/assign-driver`);
  return response.data;
}

export async function updateDriverStatus(id: string, status: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/driver-status`, {
    status,
  });

  return response.data;
}

export async function startRepair(id: string) {
  const response = await api.post(`/api/ServiceRequests/${id}/start-repair`);
  return response.data;
}

export async function uploadRepairProof(
  id: string,
  imageUrl: string,
  notes?: string
) {
  const response = await api.post(`/api/ServiceRequests/${id}/proof`, {
    imageUrl,
    notes,
  });

  return response.data;
}

export async function completeServiceRequest(id: string, finalAmount: number) {
  const response = await api.post(`/api/ServiceRequests/${id}/complete`, {
    finalAmount,
  });

  return response.data;
}