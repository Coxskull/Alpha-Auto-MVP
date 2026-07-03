import api from "@/services/api";

export const assignDriver = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/assign-driver`
  );
};

export const assignSupplier = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/assign-supplier`
  );
};
export async function driverAcceptOrder(orderId: string) {
  const response = await api.post(`/api/Orders/${orderId}/driver-accept`);
  return response.data;
}
export const markPickedUp = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/picked-up`
  );
};

export const markEnRoute = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/en-route`
  );
};

export const markDelivered = async (
  orderId: string
) => {
  return api.post(
    `/api/Orders/${orderId}/delivered`
  );
};

export async function confirmPayment(orderId: string) {
  return api.post(`/api/Orders/${orderId}/confirm-payment`, null, {
    params: {
      transactionReference: `MANUAL-${Date.now()}`,
    },
  });
};