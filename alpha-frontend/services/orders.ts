import api from "./api";
import { Order, ProviderOrder } from "@/types/order";

export type CountryCode =
  | "PH"
  | "MX"
  | "US";

export type CurrencyCode =
  | "PHP"
  | "MXN"
  | "USD";

export type PaymentGateway =
  | "cash"
  | "paymongo_gcash"
  | "paypal"
  | "stripe"
  | "maya"
  | "xendit"
  | "hitpay";

export type CreateOrderItemPayload = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  zone: string;

  countryCode: CountryCode;
  currency: CurrencyCode;
  paymentMethod: PaymentGateway;

  items: CreateOrderItemPayload[];
};

export type CreateOrderResponse = {
  message?: string;

  id?: string;

  order?: {
    id: string;
    orderNumber?: string;
    customerId?: string | null;
    customerName?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    itemDescription?: string;
    zone?: string;
    countryCode?: CountryCode;
    currency?: CurrencyCode;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  financial?: {
    id?: string;
    orderId?: string;
    currency?: CurrencyCode;
    exchangeRate?: number;
    itemSubtotal?: number;
    deliveryFee?: number;
    serviceFee?: number;
    tax?: number;
    discount?: number;
    totalAmount?: number;
    supplierAmount?: number;
    driverAmount?: number;
    mechanicAmount?: number;
    alphaPlatformFee?: number;
    supplierEarning?: number;
    driverEarning?: number;
    companyRevenue?: number;
    financialStatus?: string;
    payoutStatus?: string;
    settlementStatus?: string;
  };

  payment?: {
    id?: string;
    orderId?: string;
    amount?: number;
    currency?: CurrencyCode;
    paymentMethod?: string | null;
    paymentGateway?: string | null;
    paymentStatus?: string;
    paymentProvider?: string | null;
    requiresRedirect?: boolean;
    checkoutUrl?: string | null;
  };

  taxBreakdown?: unknown;

  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    currency?: CurrencyCode;
    lineTotal: number;
  }>;
};

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const response =
    await api.post<CreateOrderResponse>(
      "/api/Orders",
      payload
    );

  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response =
    await api.get<Order[]>("/api/Orders");

  return response.data;
}

export async function getOrder(
  id: string
): Promise<Order> {
  const response =
    await api.get<Order>(
      `/api/Orders/${id}/details`
    );

  return response.data;
}

export async function getAllOrders(): Promise<Order[]> {
  return getOrders();
}


/**
 * Get orders assigned to the currently authenticated driver.
 *
 * IMPORTANT:
 * This endpoint uses the driver's authenticated user identity.
 * Do not pass driverId from the browser.
 */
export async function getMyDriverOrders(): Promise<Order[]> {
  const response =
    await api.get<Order[]>(
      "/api/Orders/my-driver-orders"
    );

  return response.data;
}


/**
 * Backwards-compatible helper.
 *
 * The driverId parameter is retained so existing callers
 * do not immediately break, but the actual data is retrieved
 * from the authenticated-driver endpoint.
 */
export async function getDriverOrders(
  driverId?: string
): Promise<Order[]> {
  const orders = await getMyDriverOrders();

  return orders.filter(
    (order) =>
      [
        "driver_assigned",
        "driver_accepted",
        "waiting_for_pickup",
        "picked_up",
        "en_route",
        "arrived",
      ].includes(order.status)
  );
}


/**
 * Driver delivery history.
 */
export async function getDriverHistory(
  driverId?: string
): Promise<Order[]> {
  const orders = await getMyDriverOrders();

  return orders.filter(
    (order) =>
      order.status === "delivered" ||
      order.status === "completed" ||
      order.status === "proof_uploaded"
  );
}


export async function markPickedUp(
  orderId: string
) {
  return api.post(
    `/api/Orders/${orderId}/picked-up`
  );
}


export async function markEnRoute(
  orderId: string
) {
  return api.post(
    `/api/Orders/${orderId}/en-route`
  );
}


export async function markDelivered(
  orderId: string
) {
  return api.post(
    `/api/Orders/${orderId}/delivered`
  );
}


export async function uploadDeliveryProof(
  orderId: string,
  file: File
) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    `/api/Orders/${orderId}/proof`,
    formData
  );

  return response.data;
}


/**
 * Supplier / Provider Orders
 */
export const getProviderOrders =
  async (): Promise<ProviderOrder[]> => {

    const response = await api.get(
      "/api/Orders/my-supplier-orders"
    );

    return response.data;
  };


export const acceptOrder = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/supplier-accept`
  );
};


export const markReadyForPickup = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/ready-for-pickup`
  );
};


export async function getMySupplierOrders() {
  const response = await api.get(
    "/api/Orders/my-supplier-orders"
  );

  return response.data;
}