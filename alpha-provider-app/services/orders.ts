import api from "./api";
import { ProviderOrder } from "@/types/order";

export const getProviderOrders = async (): Promise<ProviderOrder[]> => {
  const response = await api.get("/Orders");
  return response.data;
};

export const acceptOrder = async (orderId: string) => {
  return api.post(
    `/providers/orders/${orderId}/accept`
  );
};

export const markReadyForPickup = async (
  orderId: string
) => {
  return api.post(
    `/providers/orders/${orderId}/ready`
  );
};