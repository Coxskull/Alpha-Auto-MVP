import api from "./api";

export async function getCustomers() {
  const response = await api.get("/api/Customers");
  return response.data;
}

export async function createCustomer(data: unknown) {
  const response = await api.post(
    "/api/Customers",
    data
  );

  return response.data;
}