import api from "./api";

export const assignDriver = async (
  orderId: number
) => {
  return api.post(
    `/Orders/${orderId}/assign-driver`
  );
};

export const assignSupplier = async (
  orderId: number
) => {
  return api.post(
    `/Orders/${orderId}/assign-supplier`
  );
};

export const markPickedUp = async (
  orderId: number
) => {
  return api.post(
    `/Orders/${orderId}/picked-up`
  );
};

export const markEnRoute = async (
  orderId: number
) => {
  return api.post(
    `/Orders/${orderId}/en-route`
  );
};

export const markDelivered = async (
  orderId: number
) => {
  return api.post(
    `/Orders/${orderId}/delivered`
  );
};