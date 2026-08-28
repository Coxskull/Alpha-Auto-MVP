import api from "@/services/api";

export type SettlementFinancial = {
  orderId?: string;
  customerPaid: number;
  currency?: string;

  supplierAmount?: number;
  driverAmount?: number;
  mechanicAmount?: number;

  supplierNetPayable?: number;
  driverNetPayable?: number;
  mechanicNetPayable?: number;

  tax?: number;
  taxCollected: number;
  taxWithheld: number;
  processingFee: number;

  alphaNetRevenue: number;
  reconciliationDifference: number;

  financialStatus: string;
  settlementStatus?: string;
  payoutStatus: string;

  completionProofUrl?: string | null;
};

export type SettlementItem = {
  id: string;
  orderFinancialId: string;

  payeeType: string;
  payeeId?: string | null;

  amount: number;
  status: string;

  reviewedBy?: string | null;
  reviewedAt?: string | null;

  createdAt: string;

  financial?: SettlementFinancial;
};

export type PendingSettlementItem = {
  orderId: string;
  orderNumber: string;
  customerName: string;

  pickupAddress: string;
  deliveryAddress: string;

  supplierId?: string | null;
  driverId?: string | null;

  status: string;

  currency: string;
  countryCode: string;

  createdAt: string;
  updatedAt: string;

  financial?: {
    id: string;

    customerPaid: number;
    currency: string;

    supplierAmount: number;
    driverAmount: number;
    mechanicAmount: number;

    supplierNetPayable: number;
    driverNetPayable: number;
    mechanicNetPayable: number;

    tax: number;
    taxCollected: number;
    taxWithheld: number;

    processingFee: number;

    alphaNetRevenue: number;

    financialStatus: string;
    settlementStatus: string;
    payoutStatus: string;

    reconciliationDifference: number;

    completionProofUrl?: string | null;
  };

  proof?: {
    id: string;
    imageUrl: string;
    uploadedAt: string;
  } | null;
};

export type VerifySettlementResponse = {
  success: boolean;
  message: string;

  financialId?: string;
  orderId?: string;

  financialStatus?: string;
  settlementStatus?: string;
  payoutStatus?: string;

  reconciliationDifference?: number;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  title?: string;
  detail?: string;
};

export async function getSettlementQueue(): Promise<
  SettlementItem[]
> {
  const res = await api.get(
    "/api/Financials/settlement-queue"
  );

  return res.data;
}

export async function getPendingSettlements(): Promise<
  PendingSettlementItem[]
> {
  const res = await api.get(
    "/api/Financials/pending-settlements"
  );

  return res.data;
}

export async function markSettlementPaid(
  id: string
) {
  const res = await api.post(
    `/api/Financials/settlement/${id}/mark-paid`
  );

  return res.data;
}

export async function getDriverWallet(
  driverId: string
) {
  const res = await api.get(
    `/api/Financials/driver/${driverId}/wallet`
  );

  return res.data;
}

export async function getSupplierEarnings(
  supplierId: string
) {
  const res = await api.get(
    `/api/Financials/supplier/${supplierId}/earnings`
  );

  return res.data;
}

export async function verifySettlement(
  orderId: string
): Promise<VerifySettlementResponse> {
  const res = await api.post(
    `/api/Financials/orders/${orderId}/verify-settlement`
  );

  return res.data;
}

export async function getMyDriverWallet() {
  const response = await api.get(
    "/api/Financials/my-driver-wallet"
  );

  return response.data;
}

export async function getMySupplierEarnings() {
  const response = await api.get(
    "/api/Financials/my-supplier-earnings"
  );

  return response.data;
}