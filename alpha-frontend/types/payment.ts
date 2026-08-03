export interface CreatePaymentRequest {
    orderId: string;
    gateway: string;
    amount: number;
    currency: string;
}

export interface CreatePaymentResponse {
    success: boolean;
    checkoutUrl: string;
    gatewayPaymentId?: string;
    error?: string;
}