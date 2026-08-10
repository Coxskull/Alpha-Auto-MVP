import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://alpha-backend-production-b8f6.up.railway.app";

export interface CreatePaymentRequest {
  orderId: string;
  gateway: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  gatewayPaymentId?: string;
  error?: string;
}

export async function createPayment(
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response =
    await axios.post<CreatePaymentResponse>(
      `${API}/api/payments/create`,
      request
    );

  return response.data;
}