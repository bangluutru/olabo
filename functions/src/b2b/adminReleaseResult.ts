import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerAdmin, writeAuditLog } from "../shared/auth";

interface ReleaseResultRequest {
  sampleId: string;
}

export const adminReleaseResult = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerAdmin(request.auth.uid, ["admin", "staff", "doctor"]);
  const data = request.data as ReleaseResultRequest;

  if (!data.sampleId) throw new HttpsError("invalid-argument", "sampleId is required");

  const db = admin.firestore();
  const sampleRef = db.collection("b2bBatchSamples").doc(data.sampleId);
  const sampleSnap = await sampleRef.get();

  if (!sampleSnap.exists) throw new HttpsError("not-found", "Sample not found");

  const sample = sampleSnap.data()!;
  const resultId = sample.resultId as string | null;

  if (!resultId) throw new HttpsError("failed-precondition", "No result attached to this sample");

  const resultSnap = await db.collection("results").doc(resultId).get();
  if (!resultSnap.exists) throw new HttpsError("not-found", "Result not found");

  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("results").doc(resultId).update({
    status: "released",
    releasedAt: now,
    releasedBy: caller.id,
    updatedAt: now,
  });

  await sampleRef.update({
    resultStatus: "released",
    status: "result_released",
    updatedAt: now,
  });

  await writeAuditLog(
    caller.id,
    caller.role,
    "result_released",
    "result",
    resultId,
    { sampleId: data.sampleId, organizationId: sample.organizationId }
  );

  return { success: true };
});
