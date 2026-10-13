"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { confirmationFor, validQuote, type PayoutKind, type PayoutQuote } from "@/lib/payoutQuote";
import { getPayoutQuote, recordPayout } from "@/services/payouts";

type Props = { kind: PayoutKind; id: string; onClose: () => void; onRecorded: () => void | Promise<void> };
function failure(error: unknown) {
  if (axios.isAxiosError(error)) return { code: error.response?.data?.code as string | undefined,
    message: error.response?.status === 403 ? "Administrator access is required to review payouts."
      : error.response?.data?.message || "Unable to review this payout. Refresh or ask an administrator to review it.",
    uncertain: !error.response || error.response.status >= 500 };
  return { code: undefined, message: "Unable to review this payout.", uncertain: false };
}
export default function PayoutReview({ kind, id, onClose, onRecorded }: Props) {
  const [quote, setQuote] = useState<PayoutQuote | null>(null);
  const [amount, setAmount] = useState(""); const [reference, setReference] = useState("");
  const [acknowledged, setAcknowledged] = useState(false); const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false); const [unknownOutcome, setUnknownOutcome] = useState(false);
  const request = useRef<AbortController | null>(null); const dialog = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const refresh = useCallback(async () => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setLoading(true); setQuote(null); setAmount(""); setAcknowledged(false);
    try {
      const value = await getPayoutQuote(kind, id, controller.signal);
      if (controller.signal.aborted || !alive.current) return;
      const row = value as { status?: string; settlementId?: string; earningId?: string; paidAmount?: number; currency?: string };
      if (row?.status?.toLowerCase() === "paid" && (kind === "settlement" ? row.settlementId : row.earningId) === id
        && typeof row.paidAmount === "number" && Number.isFinite(row.paidAmount) && row.paidAmount >= 0 && /^[A-Z]{3}$/.test(row.currency || "")) {
        setRecorded(true); setUnknownOutcome(false); setMessage("This payout is already recorded. No further confirmation will be sent.");
        try { await onRecorded(); } catch { setMessage("Payout is already recorded. Close and refresh the list to update it."); } return;
      }
      if (!validQuote(value, kind, id)) { setMessage("A current payout preview could not be validated. Refresh or request review."); return; }
      setQuote(value); setUnknownOutcome(false);
      setMessage(value.eligibleForConfirmation ? null : "Positive net payout is below the configured minimum. Keep it pending.");
    } catch (error) { if (!controller.signal.aborted && alive.current) setMessage(failure(error).message); }
    finally { if (!controller.signal.aborted && alive.current) setLoading(false); }
  }, [kind, id, onRecorded]);
  useEffect(() => {
    alive.current = true; const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => { window.clearTimeout(timer); alive.current = false; request.current?.abort(); document.body.style.overflow = overflow; if(previous?.isConnected) previous.focus(); };
  }, [refresh]);
  const confirmation = quote ? confirmationFor(quote, amount, reference, acknowledged) : null;
  async function submit() {
    if (!confirmation || saving || recorded || unknownOutcome) return;
    setSaving(true); setMessage(null);
    try { await recordPayout(kind, id, confirmation); if (!alive.current) return;
      setRecorded(true); setQuote(null); setMessage("Reviewed payout recorded successfully.");
      try { await onRecorded(); } catch { setMessage("Payout recorded. Close and refresh the list to update it."); }
    } catch (error) {
      if (!alive.current) return; const detail = failure(error);
      setAcknowledged(false); setAmount(""); setQuote(null);
      setUnknownOutcome(detail.uncertain);
      setMessage(detail.uncertain ? "Confirmation outcome is unknown. Refresh payout status before trying again. Keep the same reference."
        : detail.code === "payout_quote_changed" ? "The payout quote changed. Refresh and review the new net amount before confirming again." : detail.message);
    } finally { if (alive.current) setSaving(false); }
  }
  const money = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: quote?.currency || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="payout-review-title" className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
      onKeyDown={event => {
        if(event.key === "Escape" && !saving) onClose();
        if(event.key === "Tab") { const nodes = dialog.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"); if(!nodes?.length) return;
          const first = nodes[0], last = nodes[nodes.length-1];
          if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }}>
      <div className="flex items-center justify-between"><h2 id="payout-review-title" className="text-xl font-bold">Review payout</h2><button type="button" onClick={onClose} disabled={saving} aria-label="Close payout review">Close</button></div>
      <p className="mt-2 text-sm">Record an externally reviewed payout or zero-cash offset. This action does not send money.</p>
      {message && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">{message}</p>}
      {loading && <p role="status" className="mt-4">Loading current payout…</p>}
      {quote && <><dl className="my-5 grid grid-cols-2 gap-2 text-sm">
        <dt>Gross amount</dt><dd className="text-right">{money(quote.grossAmount)}</dd>
        <dt>Refund adjustment</dt><dd className="text-right">{money(quote.refundAdjustment)}</dd>
        {kind === "earning" && <><dt>Chargeback adjustment</dt><dd className="text-right">{money(quote.chargebackAdjustment || 0)}</dd></>}
        <dt>Payable before recovery</dt><dd className="text-right">{money(quote.payableBeforeRecovery)}</dd>
        <dt>Recovery offset</dt><dd className="text-right">{money(quote.recoveryOffset)}</dd>
        <dt className="font-bold">Net cash payout</dt><dd className="text-right font-bold" data-testid="net-payout">{money(quote.netAmount)}</dd>
        <dt>Recovery carried forward</dt><dd className="text-right">{money(quote.remainingRecoveryBalance)}</dd>
        {quote.minimumPayoutThreshold !== undefined && <><dt>Minimum positive payout</dt><dd className="text-right">{money(quote.minimumPayoutThreshold)}</dd></>}
      </dl>
      {quote.zeroNet && <p className="rounded-lg bg-blue-50 p-3 text-sm">No cash payout. This records recovery offsets; remaining recovery carries forward.</p>}
      <p className="my-3 text-sm">Quotes can change after another payout. Currency: <strong>{quote.currency}</strong>.</p>
      <label className="block text-sm font-medium">Confirmed net amount<input aria-label="Confirmed net amount" inputMode="decimal" style={{ backgroundColor: "white", color: "#0f172a", borderColor: "#cbd5e1" }} value={amount} onChange={e => setAmount(e.target.value)} disabled={saving || !quote.eligibleForConfirmation} className="mt-1 w-full rounded border p-2" /></label>
      <label className="mt-3 block text-sm font-medium">Payout / offset reference<input aria-label="Payout reference" maxLength={128} style={{ backgroundColor: "white", color: "#0f172a", borderColor: "#cbd5e1" }} value={reference} onChange={e => setReference(e.target.value)} disabled={saving || !quote.eligibleForConfirmation} className="mt-1 w-full rounded border p-2" /></label>
      <label className="my-4 flex gap-2 text-sm"><input type="checkbox" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 3, accentColor: "#047857" }} checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} disabled={saving || !quote.eligibleForConfirmation} />I confirm this net amount, currency and reference match the reviewed payout or zero-cash offset.</label>
      <button type="button" onClick={() => void submit()} style={{ color: "white", backgroundColor: confirmation && !saving ? "#047857" : "#64748b" }} disabled={!confirmation || saving || unknownOutcome} className="w-full rounded-lg bg-emerald-600 p-3 font-bold disabled:bg-slate-400">{saving ? "Recording…" : quote.zeroNet ? "Record zero-cash offset" : "Record reviewed payout"}</button></>}
      {!recorded && <button type="button" disabled={saving || loading} onClick={() => void refresh()} className="mt-4 rounded-lg border px-4 py-2">Refresh payout preview</button>}
    </div>
  </div>;
}
