export type ServiceRequestStatus =
  | "new_request"
  | "provider_needed"
  | "provider_assigned"
  | "provider_accepted"
  | "mechanic_needed"
  | "mechanic_assigned"
  | "mechanic_accepted"
  | "parts_requested"
  | "driver_needed"
  | "driver_assigned"
  | "parts_picked_up"
  | "parts_delivered"
  | "repair_started"
  | "proof_uploaded"
  | "completed"
  | "closed"
  | "cancelled";

export type ServiceRequest = {
  id: string;
  customerName: string;
  customerPhone?: string;
  vehicleInfo?: string;
  issueDescription: string;
  serviceAddress: string;
  zone: string;
  status: ServiceRequestStatus;
  finalAmount: number;
  paymentStatus?: string;
  proofImageUrl?: string;

  providerId?: string | null;
  providerName?: string | null;

  mechanicId?: string | null;
  mechanicName?: string | null;

  driverId?: string | null;
  driverName?: string | null;

  partsRequestNote?: string | null;
};

export type MissionControlOverview = {
  serviceRequests: {
    total: number;
    active: number;
    newRequests: number;
    providerNeeded: number;
    mechanicNeeded: number;
    driverNeeded: number;
    waitingForParts: number;
    completedToday: number;
  };
  financials: {
    grossRevenue: number;
    customerPaid: number;
    alphaRevenue: number;
    providerPayouts: number;
    mechanicPayouts: number;
    driverPayouts: number;
    pendingReview: number;
  };
};

export type MechanicDashboardStats = {
  jobs: {
    assigned: number;
    accepted: number;
    waitingForParts: number;
    completed: number;
  };
  financials: {
    earnings: number;
    pendingReview: number;
  };
};

export type DriverDashboardStats = {
  jobs: {
    assigned: number;
    pickedUp: number;
    delivered: number;
    completed: number;
  };
  financials: {
    earnings: number;
  };
};