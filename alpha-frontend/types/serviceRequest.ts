// types/serviceRequest.ts

export type ServiceRequest = {
  id: string;
  customerName: string;
  customerPhone?: string;
  vehicleInfo?: string;
  issueDescription: string;
  serviceAddress: string;
  zone: string;
  status: string;
  finalAmount: number;
  proofImageUrl?: string;
  providerName?: string;
mechanicName?: string;
driverName?: string;
paymentStatus?: string;
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