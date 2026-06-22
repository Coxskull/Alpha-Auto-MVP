export type OrderStatus =
  | "pending"
  | "supplier_assigned"
  | "supplier_accepted"
  | "ready_for_pickup"
  | "driver_assigned"
  | "picked_up"
  | "en_route"
  | "proof_uploaded"
  | "delivered"
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
