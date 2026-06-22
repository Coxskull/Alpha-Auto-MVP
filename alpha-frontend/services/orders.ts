import api from "./api";
import { Order, ProviderOrder } from "@/types/order";

export async function createOrder(data: {
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  zone: string;
}) {
  const response = await api.post("/api/Orders", data);
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await api.get("/api/Orders");
  return response.data;
}

export async function getOrder(id: string): Promise<Order> {
  const response = await api.get(`/api/Orders/${id}/details`);
  return response.data;
}

export async function getAllOrders(): Promise<Order[]> {
  return getOrders();
}

export async function getDriverOrders(driverId: string): Promise<Order[]> {
  const orders = await getAllOrders();
  return orders.filter(
    (order) =>
      order.driverId === driverId &&
      order.status !== "delivered" &&
      order.status !== "cancelled"
  );
}

export async function getDriverHistory(driverId: string): Promise<Order[]> {
  const orders = await getAllOrders();
  return orders.filter(
    (order) => order.driverId === driverId && order.status === "delivered"
  );
}

export async function markPickedUp(orderId: string) {
  return api.post(`/api/Orders/${orderId}/picked-up`);
}

export async function markEnRoute(orderId: string) {
  return api.post(`/api/Orders/${orderId}/en-route`);
}

export async function markDelivered(orderId: string) {
  return api.post(`/api/Orders/${orderId}/delivered`);
}

export async function uploadDeliveryProof(orderId: string, imageUrl: string) {
  return api.post(`/api/Orders/${orderId}/proof`, null, {
    params: { imageUrl },
  });
}

export const getProviderOrders = async (): Promise<ProviderOrder[]> => {
  const response = await api.get("/api/Orders");
  return response.data;
};

export const acceptOrder = async (orderId: string) => {
  return api.post(`/api/providers/orders/${orderId}/accept`);
};

export const markReadyForPickup = async (orderId: string) => {
  return api.post(`/api/providers/orders/${orderId}/ready`);
};
