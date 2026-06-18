import api from "./api";
import { Order } from "@/types/order";

export async function getAllOrders(): Promise<Order[]> {
  const response = await api.get("/Orders");
  return response.data;
}

export async function getDriverOrders(
  driverId: string
): Promise<Order[]> {
  const orders = await getAllOrders();

  return orders.filter(
    (order) =>
      order.driverId === driverId &&
      order.status !== "delivered" &&
      order.status !== "cancelled"
  );
}

export async function getDriverHistory(
  driverId: string
): Promise<Order[]> {
  const orders = await getAllOrders();

  return orders.filter(
    (order) =>
      order.driverId === driverId &&
      order.status === "delivered"
  );
}

export async function markPickedUp(orderId: string) {
  return api.post(`/Orders/${orderId}/picked-up`);
}

export async function markEnRoute(orderId: string) {
  return api.post(`/Orders/${orderId}/en-route`);
}

export async function markDelivered(orderId: string) {
  return api.post(`/Orders/${orderId}/delivered`);
}

export async function uploadDeliveryProof(
  orderId: string,
  imageUrl: string
) {
  return api.post(
    `/Orders/${orderId}/proof`,
    null,
    {
      params: {
        imageUrl,
      },
    }
  );
}