"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SampleTimeline } from "@/components/shared/SampleTimeline";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { use, useEffect, useState, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { callPartnerDownloadResultPdf } from "@/lib/firebase/b2bFunctions";
import type { B2BBatchSample } from "@/types";

export default function SampleDetailPage({ params }: { params: Promise<{ locale: string; sampleId: string }> }) {
  const { locale, sampleId } = use(params);
  const [sample, setSample] = useState<B2BBatchSample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = doc(db, "b2bBatchSamples", sampleId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setError("Sample not found");
        } else {
          setSample({ id: snap.id, ...snap.data() } as B2BBatchSample);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [sampleId]);

  const handleDownloadPdf = useCallback(async () => {
    const { url } = await callPartnerDownloadResultPdf(sampleId);
    window.open(url, "_blank");
  }, [sampleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading sample…</span>
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">{error ?? "Sample not found"}</p>
        <Button asChild variant="outline">
          <Link href={`/${locale}/partner/batches`}>Back to Batches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/partner/batches/${sample.batchId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{sample.patientName}</h1>
          <p className="text-sm text-slate-500 font-mono">Batch: {sample.batchCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Patient & Sample Info */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {[
                  ["Patient Name", sample.patientName],
                  ["Patient Code", sample.patientCode ?? "—"],
                  ["Gender", sample.patientGender],
                  ["Date of Birth", sample.patientDob ?? "—"],
                  ["Sample Type", sample.sampleType],
                  ["Sample Barcode", sample.sampleBarcode ?? "Not assigned"],
                  ["Collection Date", sample.collectionDate ?? "—"],
                  ["Received At", sample.receivedAt ?? "—"],
                  ["Partner Sample Ref", sample.partnerSampleReference ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-slate-400">{k}</span>
                    <span className={`font-medium ${k === "Sample Barcode" && !sample.sampleBarcode ? "text-slate-300" : "text-slate-800"} font-mono text-xs`}>{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Requested Tests & Packages</CardTitle></CardHeader>
            <CardContent>
              {sample.requestedTestIds.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-2">Tests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sample.requestedTestIds.map((id) => (
                      <span key={id} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 uppercase">{id}</span>
                    ))}
                  </div>
                </div>
              )}
              {sample.requestedPackageIds.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Packages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sample.requestedPackageIds.map((id) => (
                      <span key={id} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">{id}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status & Result */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sample Status</CardTitle>
                <StatusBadge status={sample.status} />
              </div>
            </CardHeader>
            <CardContent>
              <SampleTimeline currentStatus={sample.status} timestamps={{}} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Result</CardTitle>
                <StatusBadge status={sample.resultStatus} />
              </div>
            </CardHeader>
            <CardContent>
              {sample.resultId ? (
                <div className="flex flex-col gap-4">
                  {(sample.resultStatus === "ready" || sample.resultStatus === "released") && (
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                      <p className="font-medium">Result is {sample.resultStatus}</p>
                    </div>
                  )}
                  {sample.resultStatus === "pending" && (
                    <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
                      <p className="font-medium">Result is being reviewed</p>
                      <p className="text-xs mt-1">You will be notified when it is released</p>
                    </div>
                  )}
                  <PdfDownloadButton
                    resultStatus={sample.resultStatus}
                    onDownload={handleDownloadPdf}
                    className="w-full justify-center"
                    size="md"
                  />
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 text-center">
                  Result not yet available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
