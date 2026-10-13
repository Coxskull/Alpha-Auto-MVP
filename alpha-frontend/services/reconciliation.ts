import api from "./api";
import { validCapture, validReconciliation, type ReconciliationKind, type ReconciliationSnapshot, type ReconciliationCapture } from "@/lib/reconciliation";
const path=(kind:ReconciliationKind,id:string)=>`/api/payout-reconciliation/${kind}/${encodeURIComponent(id)}`;
export async function reconciliationQueue(kind:ReconciliationKind,after?:string):Promise<{rows:ReconciliationSnapshot[];next:string|null}> {
  const {data}=await api.get("/api/payout-reconciliation",{params:{kind,after,limit:20}});
  if(!data || !Array.isArray(data.rows) || data.rows.length>20 || !data.rows.every((r:unknown)=>validReconciliation(r,kind)) || !(data.next===null || typeof data.next==="string" && /^[a-f0-9-]{36}$/i.test(data.next))) throw new Error("The review queue could not be validated.");
  return data;
}
export async function inspectReconciliation(kind:ReconciliationKind,id:string):Promise<ReconciliationSnapshot> {
  const {data}=await api.get(path(kind,id)); if(!validReconciliation(data,kind,id) || !data.inspectionAvailable) throw new Error("The snapshot could not be validated."); return data;
}
export async function reconciliationHistory(kind:ReconciliationKind,id:string,after?:string):Promise<{rows:ReconciliationCapture[];next:string|null}> {
  const {data}=await api.get(path(kind,id)+"/history",{params:{after,limit:20}});
  if(!data || !Array.isArray(data.rows) || !data.rows.every((r:unknown)=>validCapture(r,kind,id)) || !(data.next===null || typeof data.next==="string")) throw new Error("Capture history could not be validated."); return data;
}
export async function captureReconciliation(q:ReconciliationSnapshot,captureId:string):Promise<ReconciliationCapture> {
  if(!q.inspectionAvailable) throw new Error("Manual review is required; capture is unavailable.");
  const {data}=await api.post(path(q.kind,q.id)+"/captures",{id:captureId,fingerprint:q.fingerprint});
  if(!validCapture(data,q.kind,q.id) || data.id!==captureId || data.snapshot.fingerprint!==q.fingerprint) throw new Error("Capture response could not be validated. Check history before retrying.");return data;
}
