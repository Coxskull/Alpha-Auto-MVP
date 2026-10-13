"use client";
import { useCallback, useEffect, useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import PayoutReview from "@/components/financials/PayoutReview";
import { getEntrepreneurAdminEarnings, type EntrepreneurEarningAdmin } from "@/services/entrepreneurAdminApi";
export default function EntrepreneurPayoutPage() { return <RoleGuard allowedRoles={["admin"]}><PayoutQueue /></RoleGuard>; }
function PayoutQueue() {
  const [rows, setRows] = useState<EntrepreneurEarningAdmin[]>([]);
  const [selected, setSelected] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setRows(await getEntrepreneurAdminEarnings()); setError(null); }
    catch { setError("Unable to load entrepreneur payouts. Refresh or request administrator review."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  return <main className="mx-auto max-w-5xl space-y-5 p-6 text-slate-900">
    <h1 className="text-2xl font-bold">Entrepreneur payout review</h1>
    <p>Review current net amounts and recovery before recording an externally reviewed payout. No money is sent here.</p>
    <button type="button" onClick={() => void load()} className="rounded border bg-white px-4 py-2">Refresh queue</button>
    {error && <p role="alert">{error}</p>}{loading ? <p>Loading payouts…</p> : rows.length === 0 ? <p>No entrepreneur earnings found.</p> :
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Earning</th><th>Currency</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="p-3">{row.id}</td><td>{row.currency}</td><td>{row.earningStatus}</td><td>
        {row.earningStatus.toUpperCase() === "APPROVED" ? <button type="button" onClick={() => setSelected(row.id)} className="rounded bg-emerald-600 px-3 py-2 text-white">Review payout</button> : <span>Held or already recorded</span>}
      </td></tr>)}</tbody></table></div>}
    {selected && <PayoutReview key={selected} kind="earning" id={selected} onClose={() => setSelected(null)} onRecorded={load} />}
  </main>;
}
