export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  zone: string;
  status: string;
  supplierId?: string;
  supplierName?: string;
  driverId?: string;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
}