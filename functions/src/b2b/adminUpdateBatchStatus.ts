import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerAdmin, writeAuditLog } from "../shared/auth";
import type { BatchStatus } from "../shared/types";

interface UpdateBatchStatusRequest {
  batchId: string;
  status: BatchStatus;
  internalNote?: string;
  pickupAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
}

export const adminUpdateBatchStatus = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerAdmin(request.auth.uid);
  const data = request.data as UpdateBatchStatusRequest;

  if (!data.batchId) throw new HttpsError("invalid-argument", "batchId is required");
  if (!data.status) throw new HttpsError("invalid-argument", "status is required");

  const db = admin.firestore();
  const batchRef = db.collection("b2bBatches").doc(data.batchId);
  const batchSnap = await batchRef.get();

  if (!batchSnap.exists) throw new HttpsError("not-found", "Batch not found");

  const now = admin.firestore.FieldValue.serverTimestamp();
  const update: Record<string, unknown> = {
    status: data.status,
    updatedAt: now,
  };

  if (data.internalNote !== undefined) update.internalNote = data.internalNote.trim();
  if (data.pickupAddress !== undefined) update.pickupAddress = data.pickupAddress.trim();
  if (data.pickupDate !== undefined) update.pickupDate = data.pickupDate;
  if (data.pickupTime !== undefined) update.pickupTime = data.pickupTime;
  if (data.status === "received") update.receivedAt = now;
  if (data.status === "completed") update.completedAt = now;
  if (data.status === "pickup_scheduled") update["samplePickupRequired"] = true;

  await batchRef.update(update);

  await writeAuditLog(
    caller.id,
    caller.role,
    "batch_status_updated",
    "b2bBatch",
    data.batchId,
    { oldStatus: batchSnap.data()?.status, newStatus: data.status }
  );

  return { success: true };
});
