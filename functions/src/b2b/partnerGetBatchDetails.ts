import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerPartner } from "../shared/auth";

export const partnerGetBatchDetails = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerPartner(request.auth.uid);
  const { batchId } = request.data as { batchId: string };

  if (!batchId) throw new HttpsError("invalid-argument", "batchId is required");

  const db = admin.firestore();
  const batchSnap = await db.collection("b2bBatches").doc(batchId).get();

  if (!batchSnap.exists) throw new HttpsError("not-found", "Batch not found");

  const batch = batchSnap.data()!;
  if (batch.organizationId !== caller.organizationId) {
    throw new HttpsError("permission-denied", "Access denied to this batch");
  }

  const samplesSnap = await db
    .collection("b2bBatchSamples")
    .where("batchId", "==", batchId)
    .orderBy("createdAt", "asc")
    .get();

  const samples = samplesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    batch: { id: batchSnap.id, ...batch },
    samples,
  };
});
