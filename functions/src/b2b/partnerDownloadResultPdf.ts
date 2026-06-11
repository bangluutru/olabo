import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerPartner, writeAuditLog } from "../shared/auth";

interface DownloadRequest {
  sampleId?: string;
  resultId?: string;
}

export const partnerDownloadResultPdf = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerPartner(request.auth.uid);
  const { sampleId, resultId: inputResultId } = request.data as DownloadRequest;

  if (!sampleId && !inputResultId) {
    throw new HttpsError("invalid-argument", "Either sampleId or resultId is required");
  }

  const db = admin.firestore();
  let resolvedResultId = inputResultId;
  let resolvedSampleId = sampleId;

  if (sampleId && !resolvedResultId) {
    const sampleSnap = await db.collection("b2bBatchSamples").doc(sampleId).get();
    if (!sampleSnap.exists) throw new HttpsError("not-found", "Sample not found");
    const sampleData = sampleSnap.data()!;
    if (sampleData.organizationId !== caller.organizationId) {
      throw new HttpsError("permission-denied", "Access denied to this sample");
    }
    if (!sampleData.resultId) throw new HttpsError("not-found", "No result linked to this sample");
    resolvedResultId = sampleData.resultId as string;
  }

  const resultSnap = await db.collection("results").doc(resolvedResultId!).get();
  if (!resultSnap.exists) throw new HttpsError("not-found", "Result not found");

  const result = resultSnap.data()!;
  if (result.organizationId !== caller.organizationId) {
    throw new HttpsError("permission-denied", "Access denied to this result");
  }
  if (result.status !== "ready" && result.status !== "released") {
    throw new HttpsError("failed-precondition", "Result is not yet available for download");
  }

  const bucket = admin.storage().bucket();
  const [signedUrl] = await bucket.file(result.pdfStoragePath as string).getSignedUrl({
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });

  await db.collection("resultDownloads").add({
    actorId: caller.id,
    actorRole: caller.role,
    organizationId: caller.organizationId,
    resultId: resolvedResultId,
    sampleId: resolvedSampleId ?? null,
    batchId: result.batchId ?? null,
    downloadType: "individual_pdf",
    downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: request.rawRequest?.ip ?? null,
    userAgent: request.rawRequest?.headers?.["user-agent"] ?? null,
  });

  await writeAuditLog(
    caller.id,
    caller.role,
    "result_pdf_downloaded",
    "result",
    resolvedResultId!,
    { sampleId: resolvedSampleId },
    caller.organizationId
  );

  return { url: signedUrl };
});
