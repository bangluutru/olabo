"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatchProgressBar } from "@/components/shared/BatchProgressBar";
import { formatDate } from "@/lib/utils";
import { use } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { B2BBatch } from "@/types";

export default function AdminBatchListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [batches, setBatches] = useState<B2BBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const q = query(collection(db, "b2bBatches"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as B2BBatch));
      setLoading(false);
    });
    return unsub;
  }, []);

  const orgs = Array.from(new Map(batches.map((b) => [b.organizationId, b.organizationName])).entries());

  const filtered = batches.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.batchCode.toLowerCase().includes(q) || b.organizationName.toLowerCase().includes(q) || (b.partnerReferenceCode ?? "").toLowerCase().includes(q);
    const matchOrg = !orgFilter || b.organizationId === orgFilter;
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchOrg && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">B2B Batches</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Batch code or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        >
          <option value="">All Organizations</option>
          {orgs.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {["submitted", "pickup_scheduled", "received", "processing", "partially_completed", "completed", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading batches…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Batch Code", "Organization", "Submitted", "Samples", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No batches found</td></tr>
                ) : filtered.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/admin/b2b-batches/${batch.id}`} className="font-mono font-semibold text-sky-700 hover:underline">
                        {batch.batchCode}
                      </Link>
                      {batch.partnerReferenceCode && (
                        <p className="text-xs text-slate-400 font-mono">{batch.partnerReferenceCode}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{batch.organizationName}</p>
                      <p className="text-xs text-slate-400">{batch.submittedByName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(batch.submittedAt)}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <BatchProgressBar completed={batch.completedSamples} total={batch.totalSamples} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={batch.status} /></td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/${locale}/admin/b2b-batches/${batch.id}`}>Manage →</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {!loading && <p className="text-xs text-slate-400">Showing {filtered.length} of {batches.length} batches</p>}
    </div>
  );
}
