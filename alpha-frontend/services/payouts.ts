import api from "./api";
import type { PayoutKind, PayoutConfirmation } from "@/lib/payoutQuote";
export function payoutPath(kind: PayoutKind, id: string, action: "quote" | "mark-paid") {
  const key = encodeURIComponent(id);
  return kind === "settlement" ? `/api/Financials/settlement/${key}/${action}`
    : `/api/admin/entrepreneur/earnings/${key}/${action === "quote" ? "payout-quote" : "mark-paid"}`;
}
export async function getPayoutQuote(kind: PayoutKind, id: string, signal?: AbortSignal): Promise<unknown> {
  return (await api.get(payoutPath(kind, id, "quote"), { signal })).data;
}
export async function recordPayout(kind: PayoutKind, id: string, confirmation: PayoutConfirmation): Promise<unknown> {
  return (await api.post(payoutPath(kind, id, "mark-paid"), confirmation)).data;
}
