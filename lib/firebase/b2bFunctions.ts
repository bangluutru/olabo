import { httpsCallable } from "firebase/functions";
import { functions } from "./config";
import type {
  B2BBatch,
  B2BBatchSample,
  CreateBatchInput,
  CreateSampleInput,
  BatchStatus,
  SampleStatus,
} from "@/types";

// ─── Response types ──────────────────────────────────────────────────────────

export interface CreateBatchResponse {
  batchId: string;
  batchCode: string;
}

export interface BatchDetailsResponse {
  batch: B2BBatch;
  samples: B2BBatchSample[];
}

export interface DownloadPdfResponse {
  url: string;
}

export interface DownloadBatchZipResponse {
  urls: { patientName: string; url: string }[];
}

export interface ExportCsvResponse {
  csv: string;
}

export interface UpdateBatchStatusResponse {
  success: boolean;
}

export interface UpdateSampleStatusResponse {
  success: boolean;
}

export interface UploadResultResponse {
  resultId: string;
  success: boolean;
}

// ─── Partner callables ────────────────────────────────────────────────────────

export async function callPartnerCreateBatch(
  batchInfo: Omit<
    CreateBatchInput,
    "organizationId" | "organizationName" | "createdBy"
  >,
  samples: CreateSampleInput[]
): Promise<CreateBatchResponse> {
  const fn = httpsCallable<unknown, CreateBatchResponse>(
    functions,
    "partnerCreateBatch"
  );
  const result = await fn({ ...batchInfo, samples });
  return result.data;
}

export async function callPartnerGetBatchDetails(
  batchId: string
): Promise<BatchDetailsResponse> {
  const fn = httpsCallable<unknown, BatchDetailsResponse>(
    functions,
    "partnerGetBatchDetails"
  );
  const result = await fn({ batchId });
  return result.data;
}

export async function callPartnerDownloadResultPdf(
  sampleId: string
): Promise<DownloadPdfResponse> {
  const fn = httpsCallable<unknown, DownloadPdfResponse>(
    functions,
    "partnerDownloadResultPdf"
  );
  const result = await fn({ sampleId });
  return result.data;
}

export async function callPartnerDownloadBatchZip(
  batchId: string
): Promise<DownloadBatchZipResponse> {
  const fn = httpsCallable<unknown, DownloadBatchZipResponse>(
    functions,
    "partnerDownloadBatchZip"
  );
  const result = await fn({ batchId });
  return result.data;
}

export async function callPartnerExportBatchCsv(
  batchId: string
): Promise<ExportCsvResponse> {
  const fn = httpsCallable<unknown, ExportCsvResponse>(
    functions,
    "partnerExportBatchCsv"
  );
  const result = await fn({ batchId });
  return result.data;
}

// ─── Admin callables ──────────────────────────────────────────────────────────

export async function callAdminUpdateBatchStatus(
  batchId: string,
  status: BatchStatus,
  internalNote?: string
): Promise<UpdateBatchStatusResponse> {
  const fn = httpsCallable<unknown, UpdateBatchStatusResponse>(
    functions,
    "adminUpdateBatchStatus"
  );
  const result = await fn({ batchId, status, internalNote });
  return result.data;
}

export async function callAdminUpdateBatchSampleStatus(
  sampleId: string,
  status: SampleStatus,
  rejectionReason?: string
): Promise<UpdateSampleStatusResponse> {
  const fn = httpsCallable<unknown, UpdateSampleStatusResponse>(
    functions,
    "adminUpdateBatchSampleStatus"
  );
  const result = await fn({ sampleId, status, rejectionReason });
  return result.data;
}

export async function callAdminReleaseResult(sampleId: string): Promise<{ success: boolean }> {
  const fn = httpsCallable<unknown, { success: boolean }>(functions, "adminReleaseResult");
  const result = await fn({ sampleId });
  return result.data;
}

export async function callAdminUploadSampleResult(
  sampleId: string,
  pdfStoragePath: string,
  testSummary: string,
  resultStatus: "pending" | "ready" | "review_required" = "pending"
): Promise<UploadResultResponse> {
  const fn = httpsCallable<unknown, UploadResultResponse>(
    functions,
    "adminUploadSampleResult"
  );
  const result = await fn({ sampleId, pdfStoragePath, testSummary, resultStatus });
  return result.data;
}
