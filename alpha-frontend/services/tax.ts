import api from "@/services/api";

export async function getTaxRules() {
  const res = await api.get("/api/Tax/rules");
  return res.data;
}

export async function calculateOrderTax(orderId: string) {
  const res = await api.post(`/api/Tax/orders/${orderId}/calculate`);
  return res.data;
}

export async function getOrderTax(orderId: string) {
  const res = await api.get(`/api/Tax/orders/${orderId}`);
  return res.data;
}