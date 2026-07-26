import api from "@/services/api";

export type PayMongoCheckoutResponse = {
  orderId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  currency: "PHP";
  amount: number;
  paymentStatus: string;
};

export async function createPayMongoCheckout(
  orderId: string
): Promise<PayMongoCheckoutResponse> {
  const response = await api.post(
    "/api/paymongo/create-checkout",
    {
      orderId,
    }
  );

  return response.data;
}

export async function verifyPayMongoCheckout(
  orderId: string,
  checkoutSessionId: string
) {
  const response = await api.post(
    "/api/paymongo/verify",
    {
      orderId,
      checkoutSessionId,
    }
  );

  return response.data;
}