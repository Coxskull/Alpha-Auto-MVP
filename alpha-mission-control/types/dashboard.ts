export type OrderStatus =
  | "pending"
  | "supplier_assigned"
  | "supplier_accepted"
  | "ready_for_pickup"
  | "driver_assigned"
  | "picked_up"
  | "en_route"
  | "cancelled"
  | "delivered";

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;

  pickupAddress: string;
  deliveryAddress: string;

  itemDescription: string;

  zone: string;

  status: OrderStatus;

  supplierId?: string;
  driverId?: string;

  supplierName?: string;
  driverName?: string;

  createdAt?: string;
  updatedAt?: string;
};

export interface Driver {
  id: string;

  fullName: string;

  vehicleType?: string;

  phoneNumber?: string;

  status?: string;

  availability?: string;

  territory?: string;

  activeJobs?: number;

  // NEW
  responseRate?: number;

  lastSeenAt?: string;
}

export interface Supplier {
  id: string;

  name: string;

  availability: string;

  territory: string;

  currentWorkload: number;

  // NEW
  responseRate?: number;

  contactNumber?: string;

  address?: string;
}

export interface DashboardStats {
  liveOrders: number;

  driversOnline: number;

  suppliersActive: number;

  deliveredToday: number;
}

export interface TimelineEvent {
  id: string;

  orderId: string;

  status: string;

  notes?: string;

  createdAt: string;
}

/* NEW */

export interface Escalation {
  id: string;

  orderId: string;

  type:
    | "SupplierTimeout"
    | "DriverTimeout"
    | "DriverInactive"
    | "DeliveryLate";

  message: string;

  resolved: boolean;

  createdAt: string;
}

export interface Recommendation {
  supplierId?: string;

  supplierName?: string;

  driverId?: string;

  driverName?: string;

  score: number;

  reason: string;
}