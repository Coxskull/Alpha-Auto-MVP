export type OrderStatus =
  | "payment_pending"
  | "payment_paid"
  | "waiting_for_supplier"
  | "supplier_assigned"
  | "supplier_accepted"
  | "waiting_for_driver"
  | "driver_assigned"
  | "driver_accepted"
  | "waiting_for_pickup"
  | "picked_up"
  | "en_route"
  | "arrived_at_destination"
  | "delivered"
  | "proof_uploaded"
  | "settlement_pending"
  | "ready_for_payout"
  | "supplier_declined"
  | "driver_declined"
  | "supplier_unavailable"
  | "driver_unavailable"
  | "customer_cancelled"
  | "payment_failed"
  | "delivery_failed"
  | "cancelled";

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  zone: string;
  status: OrderStatus;

  supplierId?: string | null;
  supplierName?: string | null;

  driverId?: string | null;
  driverName?: string | null;

  mechanicId?: string | null;
  mechanicName?: string | null;

  totalAmount?: number;
  serviceFee?: number;
  deliveryFee?: number;
  paymentStatus?: string;
  settlementStatus?: string;

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
  responseRate?: number;
  lastSeenAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  availability: string;
  territory: string;
  currentWorkload: number;
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
  status: OrderStatus | string;
  notes?: string;
  createdAt: string;
}

export interface Escalation {
  id: string;
  orderId: string;
  type:
    | "SupplierTimeout"
    | "DriverTimeout"
    | "DriverInactive"
    | "DeliveryLate"
    | "SupplierDeclined"
    | "DriverDeclined"
    | "PaymentFailed"
    | "DeliveryFailed";

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