import type {
  CommissionPolicy,
  CommissionCalculationResult,
} from "../types/autoPartsCommission";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured."
  );
}

/**
 * Build authentication headers.
 *
 * If your application uses cookie authentication,
 * credentials: "include" will send the auth cookie.
 *
 * If you use JWT stored in localStorage,
 * add the token here.
 */
function getAuthHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/**
 * Get the currently active auto-parts commission policy.
 */
export async function getCurrentPolicy(
  currency: string
): Promise<CommissionPolicy> {
  const url =
    `${API_URL}/api/admin/auto-parts-commission/current` +
    `?currency=${encodeURIComponent(currency)}`;

  console.log(
    "[AutoPartsCommission] GET:",
    url
  );

  const response = await fetch(url, {
    method: "GET",

    headers: getAuthHeaders(),

    credentials: "include",

    cache: "no-store",
  });

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const message = await response.text();

    console.error(
      "[AutoPartsCommission] API ERROR",
      {
        status: response.status,
        contentType,
        url,
        response: message,
      }
    );

    throw new Error(
      `Failed to load commission policy. HTTP ${response.status}`
    );
  }

  if (!contentType.includes("application/json")) {
    const responseText = await response.text();

    console.error(
      "[AutoPartsCommission] INVALID RESPONSE",
      {
        status: response.status,
        contentType,
        url,
        response: responseText,
      }
    );

    throw new Error(
      "Commission API returned a non-JSON response."
    );
  }

  return response.json();
}


/**
 * Preview the progressive auto-parts commission.
 *
 * IMPORTANT:
 * This does not save anything.
 */
export async function calculateCommission(
  subtotal: number,
  currency: string
): Promise<CommissionCalculationResult> {

  if (subtotal <= 0) {
    throw new Error(
      "Subtotal must be greater than zero."
    );
  }

  const url =
    `${API_URL}/api/admin/auto-parts-commission/calculate`;

  console.log(
    "[AutoPartsCommission] POST:",
    url,
    {
      subtotal,
      currency,
    }
  );

  const response = await fetch(url, {
    method: "POST",

    headers: getAuthHeaders(),

    credentials: "include",

    body: JSON.stringify({
      subtotal,
      currency,
    }),

    cache: "no-store",
  });

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const message = await response.text();

    console.error(
      "[AutoPartsCommission] CALCULATION ERROR",
      {
        status: response.status,
        contentType,
        url,
        response: message,
      }
    );

    throw new Error(
      message ||
        `Failed to calculate commission. HTTP ${response.status}`
    );
  }

  if (!contentType.includes("application/json")) {
    const responseText = await response.text();

    console.error(
      "[AutoPartsCommission] INVALID CALCULATION RESPONSE",
      {
        status: response.status,
        contentType,
        url,
        response: responseText,
      }
    );

    throw new Error(
      "Commission calculation API returned a non-JSON response."
    );
  }

  return response.json();
}