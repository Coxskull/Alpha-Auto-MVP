export type OrderStatus =
  | "payment_pending"
  | "pending"
  | "supplier_assigned"
  | "supplier_accepted"
  | "ready_for_pickup"
  | "driver_assigned"
  | "driver_accepted"
  | "picked_up"
  | "en_route"
  | "arrived"
  | "delivered"
  | "proof_uploaded"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  zone: string;
  status: OrderStatus;
  supplierId?: string;
  supplierName?: string;
  driverId?: string;
  driverName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  status: string;
  createdAt: string;
}
