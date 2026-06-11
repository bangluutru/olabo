"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SampleTimeline } from "@/components/shared/SampleTimeline";
import { use } from "react";
import { doc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import {
  callAdminUpdateBatchSampleStatus,
  callAdminUploadSampleResult,
  callAdminReleaseResult,
} from "@/lib/firebase/b2bFunctions";
import type { B2BBatchSample, SampleStatus, ResultStatus } from "@/types";

interface DownloadLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  downloadType: string;
  downloadedAt: { toDate?: () => Date } | null;
}

const SAMPLE_STATUSES: SampleStatus[] = ["registered", "received", "processing", "result_ready", "result_released", "rejected", "cancelled"];

export default function AdminSampleDetailPage({ params }: { params: Promise<{ locale: string; sampleId: string }> }) {
  const { locale, sampleId } = use(params);
  const [sample, setSample] = useState<B2BBatchSample | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<DownloadLog[]>([]);

  const [sampleStatus, setSampleStatus] = useState<SampleStatus>("registered");
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [testSummary, setTestSummary] = useState("");
  const [resultStatus, setResultStatus] = useState<"pending" | "ready" | "review_required">("pending");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const [releasing, setReleasing] = useState(false);
  const [releaseMsg, setReleaseMsg] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "b2bBatchSamples", sampleId), (snap) => {
      if (snap.exists()) {
        const s = { id: snap.id, ...snap.data() } as B2BBatchSample;
        setSample(s);
        setSampleStatus(s.status);
        setRejectionReason(s.rejectionReason ?? "");
      }
      setLoading(false);
    });
    return unsub;
  }, [sampleId]);

  useEffect(() => {
    const q = query(
      collection(db, "resultDownloads"),
      where("sampleId", "==", sampleId),
      orderBy("downloadedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setDownloads(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DownloadLog));
    });
    return unsub;
  }, [sampleId]);

  const handleSaveStatus = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await callAdminUpdateBatchSampleStatus(sampleId, sampleStatus, rejectionReason || undefined);
      setSaveMsg("Saved successfully");
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [sampleId, sampleStatus, rejectionReason]);

  const handleUploadResult = useCallback(async () => {
    if (!uploadedFile || !testSummary.trim()) return;
    if (!sample) return;

    setUploading(true);
    setUploadMsg(null);
    setUploadProgress(0);

    try {
      const path = `results/b2b/${sample.organizationId}/${sample.batchId}/${sampleId}.pdf`;
      const fileRef2 = storageRef(storage, path);
      const task = uploadBytesResumable(fileRef2, uploadedFile, { contentType: "application/pdf" });

      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve
        );
      });

      await callAdminUploadSampleResult(sampleId, path, testSummary.trim(), resultStatus);
      setUploadMsg("Result uploaded successfully");
      setUploadedFile(null);
    } catch (err: unknown) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [uploadedFile, testSummary, sample, sampleId, resultStatus]);

  const handleRelease = useCallback(async () => {
    setReleasing(true);
    setReleaseMsg(null);
    try {
      await callAdminReleaseResult(sampleId);
      setReleaseMsg("Released to partner successfully");
    } catch (err: unknown) {
      setReleaseMsg(err instanceof Error ? err.message : "Release failed");
    } finally {
      setReleasing(false);
    }
  }, [sampleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading sample…</span>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">Sample not found</p>
        <Button asChild variant="outline">
          <Link href={`/${locale}/admin/b2b-batches`}>Back to Batches</Link>
        </Button>
      </div>
    );
  }

  const currentResultStatus = sample.resultStatus;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/b2b-batches/${sample.batchId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{sample.patientName}</h1>
          <p className="text-sm text-slate-500 font-mono">{sample.batchCode} · {sample.patientCode ?? "No code"}</p>
        </div>
        <StatusBadge status={sample.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Col 1: Patient info */}
        <Card>
          <CardHeader><CardTitle>Patient & Sample</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              {[
                ["Patient Name", sample.patientName],
                ["Patient Code", sample.patientCode ?? "—"],
                ["Gender", sample.patientGender],
                ["Date of Birth", sample.patientDob ?? "—"],
                ["Sample Type", sample.sampleType],
                ["Barcode", sample.sampleBarcode ?? "Not assigned"],
                ["Partner Ref", sample.partnerSampleReference ?? "—"],
                ["Collection Date", sample.collectionDate ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-slate-800 text-right font-mono text-xs">{v}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Requested Tests</p>
                <div className="flex flex-wrap gap-1">
                  {sample.requestedTestIds.map((id) => (
                    <span key={id} className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700 uppercase">{id}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <SampleTimeline currentStatus={sample.status} timestamps={{}} />
            </div>
          </CardContent>
        </Card>

        {/* Col 2: Lab operations */}
        <Card>
          <CardHeader><CardTitle>Lab Management</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Sample Status</label>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={sampleStatus}
                onChange={(e) => setSampleStatus(e.target.value as SampleStatus)}
              >
                {SAMPLE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            {sampleStatus === "rejected" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-red-600">Rejection Reason <span className="text-red-500">*</span></label>
                <textarea
                  className="min-h-[60px] w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Describe why the sample was rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            {saveMsg && (
              <p className={`text-xs ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {saveMsg}
              </p>
            )}
            <Button onClick={handleSaveStatus} loading={saving}>
              Save Sample Status
            </Button>

            {/* PDF Upload */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-slate-700">Upload Result PDF</p>
              <Input
                label="Test Summary"
                placeholder="e.g. CBC, LFT — Normal"
                value={testSummary}
                onChange={(e) => setTestSummary(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Initial Result Status</label>
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={resultStatus}
                  onChange={(e) => setResultStatus(e.target.value as typeof resultStatus)}
                >
                  <option value="pending">Pending review</option>
                  <option value="ready">Ready for partner</option>
                  <option value="review_required">Flag for review</option>
                </select>
              </div>
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6 cursor-pointer hover:border-sky-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {uploadedFile ? (
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-medium text-slate-700">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm text-slate-500">Drop PDF here or click to browse</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)} />
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-sky-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              {uploadMsg && (
                <p className={`text-xs ${uploadMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {uploadMsg}
                </p>
              )}
              <Button
                onClick={handleUploadResult}
                loading={uploading}
                disabled={!uploadedFile || !testSummary.trim()}
              >
                <Upload className="h-4 w-4" />
                Upload Result
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Col 3: Result control */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Result Control</CardTitle>
                <StatusBadge status={currentResultStatus} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {currentResultStatus === "released" ? (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                  <p className="font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Released to partner</p>
                </div>
              ) : (
                <Button
                  variant="success"
                  onClick={handleRelease}
                  loading={releasing}
                  disabled={currentResultStatus !== "ready" && currentResultStatus !== "review_required"}
                >
                  Release to Partner
                </Button>
              )}

              {currentResultStatus === "review_required" && (
                <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700 flex gap-2">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Result is flagged for review</span>
                </div>
              )}

              {currentResultStatus === "not_started" && (
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 text-center">
                  Upload a result PDF first
                </div>
              )}

              {releaseMsg && (
                <p className={`text-xs ${releaseMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {releaseMsg}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Download history */}
          <Card>
            <CardHeader><CardTitle>Download History</CardTitle></CardHeader>
            <CardContent>
              {downloads.length === 0 ? (
                <p className="text-sm text-slate-400">No downloads yet</p>
              ) : (
                <div className="flex flex-col gap-2 text-xs">
                  {downloads.map((d) => (
                    <div key={d.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="font-medium text-slate-700">{d.actorId ?? "Partner"} ({d.actorRole ?? "partner"})</p>
                      <p className="text-slate-400">
                        {d.downloadType?.replace(/_/g, " ")} ·{" "}
                        {d.downloadedAt?.toDate?.()?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
