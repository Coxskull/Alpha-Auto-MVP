export type PayoutKind = "settlement" | "earning";
export type PayoutQuote = {
  settlementId?: string; earningId?: string; status: string; currency: string;
  grossAmount: number; refundAdjustment: number; chargebackAdjustment?: number;
  payableBeforeRecovery: number; recoveryOffset: number; paidAmount: number; netAmount: number;
  remainingRecoveryBalance: number; zeroNet: boolean; quoteIsAdvisory: boolean;
  confirmationRequired: boolean; eligibleForConfirmation: boolean;
  minimumPayoutThreshold?: number; blockedReasonCode?: string | null;
};
export type PayoutConfirmation = { paidAmount: number; currency: string; payoutReference: string };
export function validQuote(value: unknown, kind: PayoutKind, id: string): value is PayoutQuote {
  if (!value || typeof value !== "object") return false;
  const q = value as PayoutQuote;
  const amounts = [q.grossAmount, q.payableBeforeRecovery, q.recoveryOffset, q.netAmount, q.paidAmount, q.remainingRecoveryBalance];
  return (kind === "settlement" ? q.settlementId : q.earningId) === id && q.status === "quote"
    && typeof q.currency === "string" && /^[A-Z]{3}$/.test(q.currency)
    && amounts.every(n => typeof n === "number" && Number.isFinite(n) && n >= 0 && Number.isSafeInteger(Math.round(n * 100)) && Math.abs(n * 100 - Math.round(n * 100)) < 0.000001)
    && typeof q.refundAdjustment === "number" && Number.isFinite(q.refundAdjustment) && Number.isSafeInteger(Math.round(q.refundAdjustment * 100))
    && (kind !== "earning" || typeof q.chargebackAdjustment === "number" && Number.isFinite(q.chargebackAdjustment)
      && Number.isSafeInteger(Math.round(q.chargebackAdjustment * 100)) && typeof q.minimumPayoutThreshold === "number"
      && Number.isFinite(q.minimumPayoutThreshold) && q.minimumPayoutThreshold >= 0
      && q.eligibleForConfirmation === (q.netAmount === 0 || q.netAmount >= q.minimumPayoutThreshold))
    && Math.abs(q.payableBeforeRecovery - (kind === "settlement" ? q.grossAmount - q.refundAdjustment : q.grossAmount + q.refundAdjustment + (q.chargebackAdjustment || 0))) < 0.000001
    && q.netAmount === q.paidAmount && Math.abs(q.payableBeforeRecovery - q.recoveryOffset - q.netAmount) < 0.000001
    && q.zeroNet === (q.netAmount === 0) && q.quoteIsAdvisory === true && q.confirmationRequired === true
    && typeof q.eligibleForConfirmation === "boolean";
}
export function confirmationFor(q: PayoutQuote, amount: string, reference: string, acknowledged: boolean): PayoutConfirmation | null {
  if (!acknowledged || !q.eligibleForConfirmation || !/^\d+(\.\d{1,2})?$/.test(amount.trim())
    || Number(amount) !== q.netAmount || !reference.trim() || reference.trim().length > 128) return null;
  return { paidAmount: q.netAmount, currency: q.currency, payoutReference: reference.trim() };
}
