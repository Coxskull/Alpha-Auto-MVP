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