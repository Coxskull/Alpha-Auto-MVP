export type OrderStatus =
  | "Pending"
  | "Supplier Assigned"
  | "Driver Assigned"
  | "Picked Up"
  | "En Route"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: number;

  orderNumber: string;

  customerName: string;

  supplierName?: string | null;

  driverName?: string | null;

  pickupAddress: string;

  deliveryAddress: string;

  itemDescription: string;

  zone: string;

  status: OrderStatus;

  createdAt: string;

  updatedAt?: string;
}

export interface Driver {
  id: number;

  fullName: string;

  vehicleType: string;

  status: string;
}

export interface Supplier {
  id: number;
  businessName?: string;
  name?: string;
  status: string;
}

export interface DashboardStats {
  liveOrders: number;

  driversOnline: number;

  suppliersActive: number;

  deliveredToday: number;
}