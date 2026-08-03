import axios from "axios";
import {
    CreatePaymentRequest,
    CreatePaymentResponse
} from "../types/payment";

const API = import.meta.env.VITE_API_URL;

export async function createPayment(
    request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {

    const response = await axios.post<CreatePaymentResponse>(
        `${API}/api/payments/create`,
        request
    );

    return response.data;
}