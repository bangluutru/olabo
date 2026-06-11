"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatchProgressBar } from "@/components/shared/BatchProgressBar";
import { use } from "react";
import { collection, doc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { callAdminUpdateBatchStatus } from "@/lib/firebase/b2bFunctions";
import type { B2BBatch, B2BBatchSample, BatchStatus } from "@/types";

const BATCH_STATUSES: BatchStatus[] = ["submitted", "pickup_scheduled", "received", "processing", "partially_completed", "completed", "cancelled"];

export default function AdminBatchDetailPage({ params }: { params: Promise<{ locale: string; batchId: string }> }) {
  const { locale, batchId } = use(params);
  const [batch, setBatch] = useState<B2BBatch | null>(null);
  const [samples, setSamples] = useState<B2BBatchSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<BatchStatus>("submitted");
  const [internalNote, setInternalNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "b2bBatches", batchId), (snap) => {
      if (snap.exists()) {
        const b = { id: snap.id, ...snap.data() } as B2BBatch;
        setBatch(b);
        setNewStatus(b.status);
        setInternalNote(b.internalNote ?? "");
      }
      setLoading(false);
    });
    return unsub;
  }, [batchId]);

  useEffect(() => {
    const q = query(
      collection(db, "b2bBatchSamples"),
      where("batchId", "==", batchId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSamples(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as B2BBatchSample));
    });
    return unsub;
  }, [batchId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await callAdminUpdateBatchStatus(batchId, newStatus, internalNote || undefined);
      setSaveMsg("Saved successfully");
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [batchId, newStatus, internalNote]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading batch…</span>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">Batch not found</p>
        <Button asChild variant="outline">
          <Link href={`/${locale}/admin/b2b-batches`}>Back to Batches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/b2b-batches`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">{batch.batchCode}</h1>
          <p className="text-sm text-slate-500">{batch.organizationName}</p>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Batch info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Batch Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {[
                  ["Organization", batch.organizationName],
                  ["Submitted By", batch.submittedByName],
                  ["Contact", batch.submittedByPhone],
                  ["Partner Ref", batch.partnerReferenceCode ?? "—"],
                  ["Total Samples", String(batch.totalSamples)],
                  ["Received", String(batch.receivedSamples)],
                  ["Completed", String(batch.completedSamples)],
                  ["Pickup Required", batch.samplePickupRequired ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <BatchProgressBar completed={batch.completedSamples} total={batch.totalSamples} showLabel />
              </div>
            </CardContent>
          </Card>

          {/* Samples table */}
          <Card>
            <CardHeader><CardTitle>Samples ({samples.length})</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Patient", "Code", "Barcode", "Status", "Result Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {samples.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No samples</td></tr>
                  ) : samples.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{s.patientName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.patientCode ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.sampleBarcode ?? <span className="text-red-400">Not assigned</span>}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={s.resultStatus} /></td>
                      <td className="px-4 py-3">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/${locale}/admin/b2b-samples/${s.id}`}>Manage →</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Admin action panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Batch Status</label>
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BatchStatus)}
                >
                  {BATCH_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              {batch.samplePickupRequired && (
                <div className="flex flex-col gap-3 rounded-lg bg-sky-50 p-3">
                  <p className="text-xs font-medium text-sky-700 uppercase tracking-wide">Pickup Info</p>
                  <Input label="Pickup Address" defaultValue={batch.pickupAddress ?? ""} readOnly />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Date" type="date" defaultValue={batch.pickupDate ?? ""} readOnly />
                    <Input label="Time" type="time" defaultValue={batch.pickupTime ?? ""} readOnly />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Internal Note</label>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Internal note (not visible to partner)..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>
              {saveMsg && (
                <p className={`text-xs ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {saveMsg}
                </p>
              )}
              <Button onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
