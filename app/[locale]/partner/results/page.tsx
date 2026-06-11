"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { use } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { callPartnerDownloadResultPdf } from "@/lib/firebase/b2bFunctions";
import type { ResultStatus } from "@/types";

interface ResultRow {
  id: string;
  createdAt: { toDate?: () => Date } | null;
  batchId: string | null;
  patientName: string;
  patientCode: string | null;
  testSummary: string;
  status: ResultStatus;
}

export default function PartnerResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const {} = use(params);
  const { appUser: user } = useAuth();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "">("");

  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(
      collection(db, "results"),
      where("organizationId", "==", user.organizationId),
      where("resultScope", "==", "b2b"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ResultRow));
      setLoading(false);
    });
    return unsub;
  }, [user?.organizationId]);

  const filtered = results.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.patientName.toLowerCase().includes(q) || (r.patientCode ?? "").toLowerCase().includes(q) || (r.batchId ?? "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function formatResultDate(ts: ResultRow["createdAt"]) {
    if (!ts) return "—";
    const d = ts.toDate?.();
    return d ? d.toLocaleDateString() : "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Results</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Patient name, code, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ResultStatus | "")}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
          <option value="released">Released</option>
          <option value="review_required">Review Required</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading results…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Date", "Batch", "Patient", "Code", "Tests", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {results.length === 0 ? "No results yet" : "No results match your filters"}
                  </td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatResultDate(r.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-sky-700">{r.batchId ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.patientName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.patientCode ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{r.testSummary}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <PdfDownloadButton
                        resultStatus={r.status}
                        onDownload={async () => {
                          const { url } = await callPartnerDownloadResultPdf(r.id);
                          window.open(url, "_blank");
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
