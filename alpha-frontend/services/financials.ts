import api from "@/services/api";

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
};

export async function getSettlementQueue(): Promise<SettlementItem[]> {
  const res = await api.get("/api/Financials/settlement-queue");
  return res.data;
}

export async function markSettlementPaid(id: string) {
  const res = await api.post(`/api/Financials/settlement/${id}/mark-paid`);
  return res.data;
}

export async function getDriverWallet(driverId: string) {
  const res = await api.get(`/api/Financials/driver/${driverId}/wallet`);
  return res.data;
}

export async function getSupplierEarnings(supplierId: string) {
  const res = await api.get(`/api/Financials/supplier/${supplierId}/earnings`);
  return res.data;
}