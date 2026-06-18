export type OrderStatus =
  | "pending"
  | "supplier_assigned"
  | "supplier_accepted"
  | "ready_for_pickup"
  | "driver_assigned"
  | "picked_up"
  | "en_route"
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
  driverId?: string;
  supplierName?: string;
  driverName?: string;
  createdAt?: string;
  updatedAt?: string;
}