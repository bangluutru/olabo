"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CsvPreviewTable } from "@/components/shared/CsvPreviewTable";
import { parseBatchCsv, generateCsvTemplate } from "@/lib/csvParser";
import { downloadCSV } from "@/lib/utils";
import { use } from "react";
import type { CreateSampleInput, ParsedCsvRow } from "@/types";
import { callPartnerCreateBatch } from "@/lib/firebase/b2bFunctions";

const DEFAULT_SAMPLE: CreateSampleInput = {
  patientName: "",
  patientGender: "unknown",
  sampleType: "blood",
  requestedTestIds: [],
  requestedPackageIds: [],
};

export default function NewBatchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();

  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [batchInfo, setBatchInfo] = useState({
    partnerReferenceCode: "",
    submittedByName: "",
    submittedByPhone: "",
    samplePickupRequired: false,
    pickupAddress: "",
    pickupDate: "",
    pickupTime: "",
    note: "",
  });
  const [samples, setSamples] = useState<CreateSampleInput[]>([{ ...DEFAULT_SAMPLE }]);
  const [csvRows, setCsvRows] = useState<ParsedCsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function addSample() {
    setSamples((prev) => [...prev, { ...DEFAULT_SAMPLE }]);
  }

  function removeSample(i: number) {
    setSamples((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSample(i: number, field: keyof CreateSampleInput, value: string) {
    setSamples((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  async function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const parsed = await parseBatchCsv(file);
    setCsvRows(parsed);
  }

  const validCsvRows = csvRows.filter((r) => r.isValid);
  const errorCsvRows = csvRows.filter((r) => !r.isValid);

  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(isDraft = false) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const samplesPayload =
        tab === "csv"
          ? validCsvRows.map((r) => ({
              patientName: r.data.patientName,
              patientCode: r.data.patientCode || undefined,
              patientPhone: r.data.patientPhone || undefined,
              patientDob: r.data.patientDob || undefined,
              patientGender: (r.data.patientGender as CreateSampleInput["patientGender"]) || "unknown",
              sampleType: r.data.sampleType || "blood",
              requestedTestIds: r.data.requestedTestCodes ? r.data.requestedTestCodes.split(",").map((s) => s.trim()) : [],
              requestedPackageIds: r.data.requestedPackageCodes ? r.data.requestedPackageCodes.split(",").map((s) => s.trim()) : [],
              partnerSampleReference: r.data.partnerSampleReference || undefined,
              note: r.data.note || undefined,
            }))
          : samples;
      const result = await callPartnerCreateBatch(
        {
          partnerReferenceCode: batchInfo.partnerReferenceCode || null,
          submittedByName: batchInfo.submittedByName,
          submittedByPhone: batchInfo.submittedByPhone,
          samplePickupRequired: batchInfo.samplePickupRequired,
          pickupAddress: batchInfo.pickupAddress || null,
          pickupDate: batchInfo.pickupDate || null,
          pickupTime: batchInfo.pickupTime || null,
          note: batchInfo.note || null,
          isDraft,
        } as Parameters<typeof callPartnerCreateBatch>[0],
        samplesPayload
      );
      setSuccess(result.batchCode);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create batch");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Batch Submitted!</h2>
        <p className="text-slate-500">Your batch code is</p>
        <div className="rounded-xl bg-sky-50 border border-sky-200 px-8 py-4 text-2xl font-mono font-bold text-sky-700">
          {success}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`/${locale}/partner/batches`)}>
            View All Batches
          </Button>
          <Button onClick={() => setSuccess(null)}>Create Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Create New Batch</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Batch info */}
        <Card>
          <CardHeader><CardTitle>Batch Information</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input label="Partner Reference Code" placeholder="Your internal reference (optional)" value={batchInfo.partnerReferenceCode} onChange={(e) => setBatchInfo({ ...batchInfo, partnerReferenceCode: e.target.value })} />
              <Input label="Submitted By Name" required placeholder="Contact person name" value={batchInfo.submittedByName} onChange={(e) => setBatchInfo({ ...batchInfo, submittedByName: e.target.value })} />
              <Input label="Contact Phone" type="tel" required placeholder="Contact phone" value={batchInfo.submittedByPhone} onChange={(e) => setBatchInfo({ ...batchInfo, submittedByPhone: e.target.value })} />
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                <input type="checkbox" id="pickup" className="accent-sky-600" checked={batchInfo.samplePickupRequired} onChange={(e) => setBatchInfo({ ...batchInfo, samplePickupRequired: e.target.checked })} />
                <label htmlFor="pickup" className="cursor-pointer">
                  <p className="text-sm font-medium text-slate-800">Sample Pickup Required</p>
                  <p className="text-xs text-slate-400">OLabo staff will collect from your location</p>
                </label>
              </div>
              {batchInfo.samplePickupRequired && (
                <div className="flex flex-col gap-3 rounded-lg bg-sky-50 p-4">
                  <Input label="Pickup Address" required value={batchInfo.pickupAddress} onChange={(e) => setBatchInfo({ ...batchInfo, pickupAddress: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Pickup Date" type="date" value={batchInfo.pickupDate} onChange={(e) => setBatchInfo({ ...batchInfo, pickupDate: e.target.value })} />
                    <Input label="Pickup Time" type="time" value={batchInfo.pickupTime} onChange={(e) => setBatchInfo({ ...batchInfo, pickupTime: e.target.value })} />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Note (optional)</label>
                <textarea className="min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Any additional notes for the lab..." value={batchInfo.note} onChange={(e) => setBatchInfo({ ...batchInfo, note: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Add samples */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Samples</CardTitle>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                {(["manual", "csv"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 font-medium capitalize transition-colors ${tab === t ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {t === "manual" ? "Manual Entry" : "CSV Import"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tab === "manual" ? (
              <div className="flex flex-col gap-4">
                {samples.map((sample, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">Sample {i + 1}</span>
                      {samples.length > 1 && (
                        <button onClick={() => removeSample(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <Input label="Patient Name" required value={sample.patientName} onChange={(e) => updateSample(i, "patientName", e.target.value)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Patient Code" placeholder="Optional" value={sample.patientCode ?? ""} onChange={(e) => updateSample(i, "patientCode", e.target.value)} />
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-slate-700">Gender</label>
                          <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={sample.patientGender} onChange={(e) => updateSample(i, "patientGender", e.target.value)}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Sample Type <span className="text-red-500">*</span></label>
                        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={sample.sampleType} onChange={(e) => updateSample(i, "sampleType", e.target.value)}>
                          <option value="blood">Blood</option>
                          <option value="urine">Urine</option>
                          <option value="stool">Stool</option>
                          <option value="swab">Swab</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addSample} className="w-full border-dashed">
                  <Plus className="h-4 w-4" />
                  Add Another Sample
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => downloadCSV(generateCsvTemplate(), "olabo_batch_template.csv")}
                  className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">
                    {csvFileName || "Drop your CSV file here, or click to browse"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports .csv files only. Max 1000 rows.</p>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
                </div>
                {csvRows.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        {validCsvRows.length} valid rows
                      </span>
                      {errorCsvRows.length > 0 && (
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          {errorCsvRows.length} rows with errors
                        </span>
                      )}
                    </div>
                    <CsvPreviewTable rows={csvRows} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">
            {tab === "manual"
              ? `${samples.filter((s) => s.patientName).length} sample(s) added`
              : `${validCsvRows.length} valid sample(s) ready`}
          </span>
          {submitError && <span className="text-xs text-red-600">{submitError}</span>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSubmit(true)} loading={submitting}>
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            loading={submitting}
            disabled={
              !batchInfo.submittedByName ||
              !batchInfo.submittedByPhone ||
              (tab === "manual" && !samples.some((s) => s.patientName)) ||
              (tab === "csv" && validCsvRows.length === 0)
            }
          >
            Submit Batch →
          </Button>
        </div>
      </div>
    </div>
  );
}
