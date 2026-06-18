import api from "./api";

export async function createOrder(
  data: {
    customerName: string;
    pickupAddress: string;
    deliveryAddress: string;
    itemDescription: string;
    zone: string;
  }
) {
  const response = await api.post(
    "/api/Orders",
    data
  );

  return response.data;
}

export async function getOrders() {
  const response = await api.get(
    "/api/Orders"
  );

  return response.data;
}

export async function getOrder(
  id: string
) {
  console.log(
    "Fetching Order:",
    id
  );

  const response = await api.get(
    `/api/Orders/${id}/details`
  );

  return response.data;
}