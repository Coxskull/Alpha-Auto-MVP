export type ReconciliationKind = "settlement" | "earning";
export type ReconciliationSnapshot = {
  kind: ReconciliationKind; id: string; orderId: string; payeeType: string; payeeId: string | null;
  currency: string; status: string; grossAmount: number; adjustment: number; recoveryOffset: number;
  expectedNet: number; recordedNet: number | null; reference: string | null; issues: string[]; fingerprint: string;
};
export type ReconciliationCapture = {id: string; actor: string; capturedAt: string; snapshot: ReconciliationSnapshot};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validReconciliation(v: unknown, kind: ReconciliationKind, id?: string): v is ReconciliationSnapshot {
  if(!v || typeof v !== "object") return false; const q=v as ReconciliationSnapshot;
  return q.kind===kind && typeof q.id==="string" && uuid.test(q.id) && (!id || id===q.id)
    && typeof q.orderId==="string" && uuid.test(q.orderId) && (q.payeeId===null || typeof q.payeeId==="string" && uuid.test(q.payeeId))
    && typeof q.payeeType==="string" && typeof q.currency==="string" && typeof q.status==="string"
    && [q.grossAmount,q.adjustment,q.recoveryOffset,q.expectedNet].every(n=>typeof n==="number" && Number.isFinite(n) && Math.abs(n)<=1e12)
    && (q.recordedNet===null || typeof q.recordedNet==="number" && Number.isFinite(q.recordedNet) && Math.abs(q.recordedNet)<=1e12)
    && (q.reference===null || typeof q.reference==="string") && Array.isArray(q.issues) && q.issues.length<=50 && q.issues.every(s=>typeof s==="string")
    && typeof q.fingerprint==="string" && /^[a-f0-9]{64}$/.test(q.fingerprint);
}
export function validCapture(v: unknown, kind: ReconciliationKind, id: string): v is ReconciliationCapture {
  if(!v || typeof v !== "object") return false; const c=v as ReconciliationCapture;
  return typeof c.id==="string" && uuid.test(c.id) && typeof c.actor==="string" && uuid.test(c.actor)
    && typeof c.capturedAt==="string" && Number.isFinite(Date.parse(c.capturedAt)) && validReconciliation(c.snapshot,kind,id);
}
