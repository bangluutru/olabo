"use client";

import Link from "next/link";
import { PlusCircle, Search, Truck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatchProgressBar } from "@/components/shared/BatchProgressBar";
import { formatDate } from "@/lib/utils";
import { use } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import type { B2BBatch, BatchStatus } from "@/types";

const STATUS_OPTS: BatchStatus[] = ["submitted", "received", "processing", "partially_completed", "completed", "cancelled"];

export default function BatchListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { appUser: user } = useAuth();
  const [batches, setBatches] = useState<B2BBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "">("");

  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(
      collection(db, "b2bBatches"),
      where("organizationId", "==", user.organizationId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setBatches(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as B2BBatch));
      setLoading(false);
    });
    return unsub;
  }, [user?.organizationId]);

  const filtered = batches.filter((b) => {
    const matchSearch = !search || b.batchCode.toLowerCase().includes(search.toLowerCase()) || (b.partnerReferenceCode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Batches</h1>
        <Button asChild>
          <Link href={`/${locale}/partner/batches/new`}>
            <PlusCircle className="h-4 w-4" />
            New Batch
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Batch code or partner ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BatchStatus | "")}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
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
                  {["Batch Code", "Partner Ref", "Submitted", "Samples", "Status", "Pickup", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      {batches.length === 0 ? "No batches yet. Create your first batch!" : "No batches match your filters"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/${locale}/partner/batches/${batch.id}`} className="font-mono font-semibold text-sky-700 hover:underline">
                          {batch.batchCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {batch.partnerReferenceCode ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {batch.submittedAt ? formatDate(batch.submittedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <BatchProgressBar completed={batch.completedSamples} total={batch.totalSamples} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={batch.status} /></td>
                      <td className="px-4 py-3">
                        {batch.samplePickupRequired ? (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Truck className="h-3.5 w-3.5 text-sky-500" /> Required
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/${locale}/partner/batches/${batch.id}`}>View →</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {!loading && <p className="text-xs text-slate-400">Showing {filtered.length} of {batches.length} batches</p>}
    </div>
  );
}
