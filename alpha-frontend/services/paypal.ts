// services/paypal.ts
import api from "@/services/api";

export async function createPayPalOrder(orderId: string) {
  const response = await api.post("/api/paypal/create-order", {
    orderId,
  });

  return response.data.id as string;
}

export async function capturePayPalOrder(orderId: string, payPalOrderId: string) {
  const response = await api.post("/api/paypal/capture-order", {
    orderId,
    payPalOrderId,
  });

  return response.data;
}