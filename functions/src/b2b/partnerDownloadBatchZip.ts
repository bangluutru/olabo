import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerPartner, writeAuditLog } from "../shared/auth";

/**
 * MVP: Returns array of signed URLs for all ready/released PDFs in the batch.
 * ZIP generation is documented as roadmap (requires streaming JSZip + Cloud Storage write).
 */
export const partnerDownloadBatchZip = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerPartner(request.auth.uid);
  const { batchId } = request.data as { batchId: string };

  if (!batchId) throw new HttpsError("invalid-argument", "batchId is required");

  const db = admin.firestore();
  const batchSnap = await db.collection("b2bBatches").doc(batchId).get();

  if (!batchSnap.exists) throw new HttpsError("not-found", "Batch not found");

  const batchData = batchSnap.data()!;
  if (batchData.organizationId !== caller.organizationId) {
    throw new HttpsError("permission-denied", "Access denied");
  }

  const samplesSnap = await db
    .collection("b2bBatchSamples")
    .where("batchId", "==", batchId)
    .where("resultId", "!=", null)
    .get();

  const urls: { patientName: string; patientCode: string | null; url: string }[] = [];
  const bucket = admin.storage().bucket();
  const expires = Date.now() + 15 * 60 * 1000;

  for (const sampleDoc of samplesSnap.docs) {
    const sample = sampleDoc.data();
    if (!sample.resultId) continue;

    const resultSnap = await db.collection("results").doc(sample.resultId as string).get();
    if (!resultSnap.exists) continue;

    const result = resultSnap.data()!;
    if (result.status !== "ready" && result.status !== "released") continue;
    if (!result.pdfStoragePath) continue;

    const [signedUrl] = await bucket.file(result.pdfStoragePath as string).getSignedUrl({
      action: "read",
      expires,
    });

    urls.push({
      patientName: sample.patientName as string,
      patientCode: (sample.patientCode as string) ?? null,
      url: signedUrl,
    });
  }

  await db.collection("resultDownloads").add({
    actorId: caller.id,
    actorRole: caller.role,
    organizationId: caller.organizationId,
    resultId: "batch-bulk-download",
    sampleId: null,
    batchId,
    downloadType: "batch_zip",
    downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: null,
    userAgent: null,
  });

  await writeAuditLog(
    caller.id,
    caller.role,
    "batch_bulk_download",
    "b2bBatch",
    batchId,
    { downloadCount: urls.length },
    caller.organizationId
  );

  return {
    urls,
    note: "ZIP generation is planned as roadmap. Current implementation returns individual signed URLs.",
  };
});
