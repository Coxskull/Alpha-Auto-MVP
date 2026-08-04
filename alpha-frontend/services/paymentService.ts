import axios from "axios";
import {
    CreatePaymentRequest,
    CreatePaymentResponse
} from "../types/payment";

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://alpha-backend-production-b8f6.up.railway.app/";

export async function createPayment(
    request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {

    const response = await axios.post<CreatePaymentResponse>(
        `${API}/api/payments/create`,
        request
    );

    return response.data;
}