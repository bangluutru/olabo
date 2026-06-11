import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerAdmin, writeAuditLog } from "../shared/auth";
import type { SampleStatus } from "../shared/types";

interface UpdateSampleStatusRequest {
  sampleId: string;
  status: SampleStatus;
  rejectionReason?: string;
  sampleBarcode?: string;
}

export const adminUpdateBatchSampleStatus = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerAdmin(request.auth.uid);
  const data = request.data as UpdateSampleStatusRequest;

  if (!data.sampleId) throw new HttpsError("invalid-argument", "sampleId is required");
  if (!data.status) throw new HttpsError("invalid-argument", "status is required");
  if (data.status === "rejected" && !data.rejectionReason?.trim()) {
    throw new HttpsError("invalid-argument", "rejectionReason is required when rejecting a sample");
  }

  const db = admin.firestore();
  const sampleRef = db.collection("b2bBatchSamples").doc(data.sampleId);
  const sampleSnap = await sampleRef.get();

  if (!sampleSnap.exists) throw new HttpsError("not-found", "Sample not found");

  const now = admin.firestore.FieldValue.serverTimestamp();
  const update: Record<string, unknown> = {
    status: data.status,
    updatedAt: now,
  };

  if (data.rejectionReason) update.rejectionReason = data.rejectionReason.trim();
  if (data.sampleBarcode) update.sampleBarcode = data.sampleBarcode.trim();
  if (data.status === "received") update.receivedAt = new Date().toISOString();

  await sampleRef.update(update);

  // Recalculate batch counters
  const sampleData = sampleSnap.data()!;
  const batchRef = db.collection("b2bBatches").doc(sampleData.batchId as string);
  const samplesSnap = await db
    .collection("b2bBatchSamples")
    .where("batchId", "==", sampleData.batchId)
    .get();

  const received = samplesSnap.docs.filter((d) => {
    const s = d.id === data.sampleId ? data.status : d.data().status;
    return s !== "registered" && s !== "cancelled";
  }).length;

  const completed = samplesSnap.docs.filter((d) => {
    const s = d.id === data.sampleId ? data.status : d.data().status;
    return s === "result_released" || s === "result_ready";
  }).length;

  const total = samplesSnap.size;
  let batchStatus = "processing";
  if (completed === total) batchStatus = "completed";
  else if (completed > 0) batchStatus = "partially_completed";

  await batchRef.update({
    receivedSamples: received,
    completedSamples: completed,
    status: batchStatus,
    updatedAt: now,
    ...(completed === total ? { completedAt: now } : {}),
  });

  await writeAuditLog(
    caller.id,
    caller.role,
    "sample_status_updated",
    "b2bBatchSample",
    data.sampleId,
    { oldStatus: sampleData.status, newStatus: data.status, batchId: sampleData.batchId }
  );

  return { success: true };
});
