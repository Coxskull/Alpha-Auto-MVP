import api from "./api";

export async function getVehicles(customerId: string) {
  const response = await api.get(
    `/api/Vehicles/customer/${customerId}`
  );

  return response.data;
}