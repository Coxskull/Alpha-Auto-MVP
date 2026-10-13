"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import axios from "axios";
import RoleGuard from "@/components/auth/RoleGuard";
import type {ReconciliationKind,ReconciliationSnapshot,ReconciliationCapture} from "@/lib/reconciliation";
import {reconciliationQueue,inspectReconciliation,reconciliationHistory,captureReconciliation} from "@/services/reconciliation";
export default function Page(){return <RoleGuard allowedRoles={["admin"]}><ReviewQueue /></RoleGuard>;}
function ReviewQueue(){
  const [kind,setKind]=useState<ReconciliationKind>("settlement");const [rows,setRows]=useState<ReconciliationSnapshot[]>([]);
  const [next,setNext]=useState<string|null>(null);const [cursor,setCursor]=useState<string|undefined>();const [exceptions,setExceptions]=useState(false);
  const [selected,setSelected]=useState<ReconciliationSnapshot|null>(null);const [history,setHistory]=useState<ReconciliationCapture[]>([]);const [historyNext,setHistoryNext]=useState<string|null>(null);
  const [pending,setPending]=useState<{snapshot:ReconciliationSnapshot;id:string}|null>(null);const [busy,setBusy]=useState(false);const [saving,setSaving]=useState(false);const [message,setMessage]=useState<string|null>(null);
  const generation=useRef(0); const alive=useRef(true); const posting=useRef(false);
  const load=useCallback(async()=>{const current=++generation.current;setBusy(true);setRows([]);setMessage(null);
    try{const data=await reconciliationQueue(kind,cursor);if(!alive.current||current!==generation.current)return;setRows(data.rows);setNext(data.next);}
    catch{if(alive.current&&current===generation.current)setMessage("Unable to load reconciliation records. Refresh or request administrator review.");}
    finally{if(alive.current&&current===generation.current)setBusy(false);}
  },[kind,cursor]);
  useEffect(()=>{alive.current=true;const timer=setTimeout(()=>void load(),0);return()=>{clearTimeout(timer);alive.current=false;++generation.current;};},[load]);
  async function inspect(q:ReconciliationSnapshot){if(saving)return;const current=++generation.current;setBusy(true);setSelected(null);setPending(null);setHistory([]);setMessage(null);
    try{const [fresh,h]=await Promise.all([inspectReconciliation(q.kind,q.id),reconciliationHistory(q.kind,q.id)]);if(!alive.current||current!==generation.current)return;setSelected(fresh);setHistory(h.rows);setHistoryNext(h.next);if(pending&&h.rows.some(c=>c.id===pending.id&&c.snapshot.fingerprint===pending.snapshot.fingerprint)){setPending(null);setMessage("Snapshot capture found in immutable history. No repeat request is needed.");}}
    catch{if(alive.current&&current===generation.current)setMessage("Unable to inspect this payout or its history. No capture was sent.");}
    finally{if(alive.current&&current===generation.current)setBusy(false);}
  }
  async function capture(){if(!selected||posting.current||busy)return;posting.current=true;setSaving(true);setMessage(null);const request=pending??{snapshot:selected,id:crypto.randomUUID()};setPending(request);
    try{const c=await captureReconciliation(request.snapshot,request.id);if(!alive.current)return;setHistory(old=>[c,...old.filter(x=>x.id!==c.id)]);setPending(null);setMessage("Snapshot captured. This records an observation only; it does not approve or release a payout.");}
    catch(error){if(!alive.current)return;if(axios.isAxiosError(error)&&error.response&&error.response.status<500){setPending(null);setSelected(null);setMessage("Evidence changed or access was denied. Inspect the current payout before capturing again.");}
      else setMessage("Capture outcome is unknown. Check history or explicitly retry the same capture; no automatic retry will occur.");}
    finally{posting.current=false;if(alive.current)setSaving(false);}
  }
  async function moreHistory(){if(!selected||saving||busy)return;setBusy(true);try{const h=await reconciliationHistory(selected.kind,selected.id,pending?undefined:historyNext??undefined);if(!alive.current)return;setHistory(old=>[...old,...h.rows.filter(x=>!old.some(y=>x.id===y.id))]);setHistoryNext(h.next);if(pending&&h.rows.some(c=>c.id===pending.id&&c.snapshot.fingerprint===pending.snapshot.fingerprint)){setPending(null);setMessage("Snapshot capture found in immutable history. No repeat request is needed.");}}
    catch{if(alive.current)setMessage("Unable to load capture history.");}finally{if(alive.current)setBusy(false);}}
  const visible=rows.filter(q=>!exceptions||q.issues.length>0);
  const money=(n:number|null,currency:string)=>n===null?"Missing":`${n.toFixed(2)} ${currency||"Unknown currency"}`;
  return <main className="mx-auto max-w-6xl space-y-5 rounded bg-slate-50 p-6 text-slate-900"><h1 className="text-2xl font-bold">Payout reconciliation</h1>
    <p>Compare internal records and preserve review snapshots. No external bank/provider verification, approval, money transfer, or hold release occurs here.</p>
    <div className="flex flex-wrap gap-3"><label>Payout type <select style={{backgroundColor:"white",color:"#0f172a"}} aria-label="Payout type" value={kind} disabled={busy||saving||!!pending} onChange={e=>{setKind(e.target.value as ReconciliationKind);setCursor(undefined);setSelected(null);}} className="rounded border bg-white p-2"><option value="settlement">Supplier / driver</option><option value="earning">Entrepreneur</option></select></label>
    <label><input type="checkbox" style={{width:16,height:16,marginRight:8}} checked={exceptions} onChange={e=>setExceptions(e.target.checked)} /> Exceptions on this page only</label>
    <button disabled={busy||saving||!!pending} onClick={()=>void load()} className="rounded border bg-white px-4">Refresh queue</button></div>
    {message&&<p role="status" className="rounded bg-amber-50 p-3">{message}</p>}{busy&&<p role="status">Loading review evidence…</p>}
    <div className="overflow-x-auto rounded border bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Payout</th><th>Payee</th><th>Currency / status</th><th>Exceptions</th><th>Action</th></tr></thead><tbody>{visible.map(q=><tr key={q.id} className="border-t"><td className="p-3">{q.id}</td><td>{q.payeeType}: {q.payeeId||"Missing"}</td><td>{q.currency} / {q.status}</td><td>{q.issues.length||"None detected"}</td><td><button disabled={busy||saving||!!pending} onClick={()=>void inspect(q)} className="rounded border p-2">Inspect</button></td></tr>)}</tbody></table>{!busy&&!visible.length&&<p className="p-3">No matching records on this page. Other pages may contain exceptions.</p>}</div>
    <div className="flex gap-3"><button disabled={busy||saving||!!pending||!cursor} onClick={()=>setCursor(undefined)}>First page</button><button disabled={busy||saving||!!pending||!next} onClick={()=>setCursor(next??undefined)}>Next page</button></div>
    {selected&&<section aria-label="Reconciliation snapshot" className="space-y-3 rounded border bg-white p-5"><h2 className="text-xl font-bold">Current internal snapshot</h2><p>Order {selected.orderId} · {selected.payeeType} {selected.payeeId} · {selected.status}</p>
      <dl className="grid grid-cols-2 gap-2"><dt>Gross</dt><dd>{money(selected.grossAmount,selected.currency)}</dd><dt>Signed adjustment</dt><dd>{money(selected.adjustment,selected.currency)}</dd><dt>Recovery offset</dt><dd>{money(selected.recoveryOffset,selected.currency)}</dd><dt>Expected net</dt><dd>{money(selected.expectedNet,selected.currency)}</dd><dt>Recorded net</dt><dd>{money(selected.recordedNet,selected.currency)}</dd><dt>Reference</dt><dd className="break-all">{selected.reference||"Missing / not recorded"}</dd></dl>
      {selected.issues.length?<ul aria-label="Reconciliation exceptions">{selected.issues.map(issue=><li key={issue}>{issue.replaceAll("_"," ")}</li>)}</ul>:<p>No exceptions detected in this internal snapshot. This is not bank settlement evidence.</p>}
      <button disabled={saving||busy} onClick={()=>void capture()} className="rounded border bg-white px-4 py-2">{saving?"Capturing…":pending?"Retry same capture":"Capture review snapshot"}</button>
      <button disabled={saving||busy} onClick={()=>void moreHistory()} className="ml-3 rounded border px-4 py-2">{pending?"Check capture history":historyNext?"More capture history":"Refresh capture history"}</button>
      <h3 className="font-bold">Immutable capture history</h3>{history.map(c=><article key={c.id} className="border-t pt-2"><p>{new Date(c.capturedAt).toLocaleString()} · {c.actor} · {c.snapshot.issues.length} exceptions</p><p className="break-all text-xs">Capture {c.id} · fingerprint {c.snapshot.fingerprint}</p></article>)}
    </section>}
  </main>;
}
