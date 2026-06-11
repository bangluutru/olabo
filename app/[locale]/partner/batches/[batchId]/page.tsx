"use client";

import Link from "next/link";
import { Download, FileSpreadsheet, Printer, MessageSquare, ArrowLeft, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatchProgressBar } from "@/components/shared/BatchProgressBar";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { formatDate } from "@/lib/utils";
import { downloadCSV } from "@/lib/utils";
import { use } from "react";
import {
  callPartnerGetBatchDetails,
  callPartnerDownloadResultPdf,
  callPartnerExportBatchCsv,
  callPartnerDownloadBatchZip,
} from "@/lib/firebase/b2bFunctions";
import type { B2BBatch, B2BBatchSample } from "@/types";

export default function BatchDetailPage({ params }: { params: Promise<{ locale: string; batchId: string }> }) {
  const { locale, batchId } = use(params);
  const [batch, setBatch] = useState<B2BBatch | null>(null);
  const [samples, setSamples] = useState<B2BBatchSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sampleSearch, setSampleSearch] = useState("");
  const [sampleStatusFilter, setSampleStatusFilter] = useState("");
  const [exportingCsv, setExportingCsv] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const loadBatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callPartnerGetBatchDetails(batchId);
      setBatch(data.batch);
      setSamples(data.samples);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load batch");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => { loadBatch(); }, [loadBatch]);

  async function handleExportCsv() {
    setExportingCsv(true);
    try {
      const { csv } = await callPartnerExportBatchCsv(batchId);
      downloadCSV(csv, `batch-${batch?.batchCode ?? batchId}-export.csv`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingCsv(false);
    }
  }

  async function handleDownloadAll() {
    setDownloadingAll(true);
    try {
      const { urls } = await callPartnerDownloadBatchZip(batchId);
      for (const { url, patientName } of urls) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `result-${patientName.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading batch…</span>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">{error ?? "Batch not found"}</p>
        <Button variant="outline" onClick={loadBatch}>Retry</Button>
      </div>
    );
  }

  const readyCount = samples.filter((s) => s.resultStatus === "ready" || s.resultStatus === "released").length;

  const filteredSamples = samples.filter((s) => {
    const q = sampleSearch.toLowerCase();
    const matchSearch = !q || s.patientName.toLowerCase().includes(q) || (s.patientCode ?? "").toLowerCase().includes(q) || (s.sampleBarcode ?? "").toLowerCase().includes(q);
    const matchStatus = !sampleStatusFilter || s.status === sampleStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/partner/batches`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 font-mono">{batch.batchCode}</h1>
        <StatusBadge status={batch.status} />
      </div>

      {/* Batch summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              {[
                ["Organization", batch.organizationName],
                ["Submitted By", batch.submittedByName],
                ["Contact", batch.submittedByPhone],
                ["Partner Ref", batch.partnerReferenceCode ?? "—"],
                ["Submitted", formatDate(batch.submittedAt)],
                ["Received", formatDate(batch.receivedAt)],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <BatchProgressBar completed={batch.completedSamples} total={batch.totalSamples} showLabel />
            {batch.samplePickupRequired && (
              <div className="rounded-lg bg-sky-50 p-3 text-sm">
                <p className="font-medium text-sky-800">Pickup Scheduled</p>
                <p className="text-sky-600">{batch.pickupDate} at {batch.pickupTime}</p>
                <p className="text-xs text-slate-500 mt-1">{batch.pickupAddress}</p>
              </div>
            )}
            {batch.note && (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-medium">Note</p>
                <p>{batch.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action toolbar */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExportCsv} loading={exportingCsv}>
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" disabled={readyCount === 0} onClick={handleDownloadAll} loading={downloadingAll}>
          <Download className="h-4 w-4" />
          Download Ready Results ({readyCount})
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print Summary
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href="mailto:support@olabo.vn">
            <MessageSquare className="h-4 w-4" />
            Contact Support
          </a>
        </Button>
      </div>

      {/* Samples table */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Samples ({samples.length})</CardTitle>
            <div className="flex flex-wrap gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  className="h-8 rounded-md border border-slate-200 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Search patient/barcode..."
                  value={sampleSearch}
                  onChange={(e) => setSampleSearch(e.target.value)}
                />
              </div>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={sampleStatusFilter}
                onChange={(e) => setSampleStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {["registered", "received", "processing", "result_ready", "result_released", "rejected"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["#", "Patient", "Code", "Barcode", "Tests", "Sample Status", "Result Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">No samples found</td>
                </tr>
              ) : (
                filteredSamples.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.patientName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.patientCode ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.sampleBarcode ?? <span className="text-slate-300">Not assigned</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.requestedTestIds.map((id) => (
                          <span key={id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 uppercase">{id}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={s.resultStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/${locale}/partner/samples/${s.id}`}>View</Link>
                        </Button>
                        <PdfDownloadButton
                          resultStatus={s.resultStatus}
                          onDownload={async () => {
                            const { url } = await callPartnerDownloadResultPdf(s.id);
                            window.open(url, "_blank");
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
