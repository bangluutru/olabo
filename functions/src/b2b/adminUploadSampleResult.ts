import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerAdmin, writeAuditLog } from "../shared/auth";

interface UploadResultRequest {
  sampleId: string;
  pdfStoragePath: string;
  testSummary: string;
  resultStatus?: "pending" | "ready" | "review_required";
}

export const adminUploadSampleResult = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerAdmin(request.auth.uid, ["admin", "staff", "doctor"]);
  const data = request.data as UploadResultRequest;

  if (!data.sampleId) throw new HttpsError("invalid-argument", "sampleId is required");
  if (!data.pdfStoragePath) throw new HttpsError("invalid-argument", "pdfStoragePath is required");
  if (!data.testSummary) throw new HttpsError("invalid-argument", "testSummary is required");

  const db = admin.firestore();
  const sampleRef = db.collection("b2bBatchSamples").doc(data.sampleId);
  const sampleSnap = await sampleRef.get();

  if (!sampleSnap.exists) throw new HttpsError("not-found", "Sample not found");

  const sample = sampleSnap.data()!;
  const now = admin.firestore.FieldValue.serverTimestamp();
  const resultStatus = data.resultStatus ?? "pending";

  let resultId = sample.resultId as string | null;

  if (!resultId) {
    // Create new result record
    const resultCode = "R-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    const resultRef = await db.collection("results").add({
      resultCode,
      resultScope: "b2b",
      batchId: sample.batchId,
      batchSampleId: data.sampleId,
      organizationId: sample.organizationId,
      patientName: sample.patientName,
      patientCode: sample.patientCode ?? null,
      sampleBarcode: sample.sampleBarcode ?? null,
      testSummary: data.testSummary.trim(),
      pdfStoragePath: data.pdfStoragePath,
      status: resultStatus,
      releasedAt: null,
      releasedBy: null,
      viewedAt: null,
      downloadedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    resultId = resultRef.id;
  } else {
    // Update existing result
    await db.collection("results").doc(resultId).update({
      pdfStoragePath: data.pdfStoragePath,
      testSummary: data.testSummary.trim(),
      status: resultStatus,
      updatedAt: now,
    });
  }

  // Link result back to sample and update resultStatus
  await sampleRef.update({
    resultId,
    resultStatus,
    status: resultStatus === "ready" ? "result_ready" : "processing",
    updatedAt: now,
  });

  await writeAuditLog(
    caller.id,
    caller.role,
    "result_uploaded",
    "result",
    resultId!,
    { sampleId: data.sampleId, pdfStoragePath: data.pdfStoragePath, resultStatus }
  );

  return { resultId, success: true };
});
