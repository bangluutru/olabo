import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resolveCallerPartner, generateBatchCode, writeAuditLog } from "../shared/auth";
import type { SampleInput } from "../shared/types";

interface CreateBatchRequest {
  partnerReferenceCode?: string;
  submittedByName: string;
  submittedByPhone: string;
  samplePickupRequired: boolean;
  pickupAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  note?: string;
  samples: SampleInput[];
}

export const partnerCreateBatch = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

  const caller = await resolveCallerPartner(request.auth.uid);
  const data = request.data as CreateBatchRequest;

  if (!data.submittedByName?.trim()) throw new HttpsError("invalid-argument", "submittedByName is required");
  if (!data.submittedByPhone?.trim()) throw new HttpsError("invalid-argument", "submittedByPhone is required");
  if (!Array.isArray(data.samples) || data.samples.length === 0) {
    throw new HttpsError("invalid-argument", "At least one sample is required");
  }
  for (const s of data.samples) {
    if (!s.patientName?.trim()) throw new HttpsError("invalid-argument", "patientName is required for each sample");
    if (!s.sampleType?.trim()) throw new HttpsError("invalid-argument", "sampleType is required for each sample");
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const batchCode = generateBatchCode();

  const batchRef = db.collection("b2bBatches").doc();
  const batch = db.batch();

  batch.set(batchRef, {
    batchCode,
    organizationId: caller.organizationId,
    organizationName: caller.organizationName ?? "",
    createdBy: caller.id,
    submittedByName: data.submittedByName.trim(),
    submittedByPhone: data.submittedByPhone.trim(),
    partnerReferenceCode: data.partnerReferenceCode?.trim() ?? null,
    samplePickupRequired: data.samplePickupRequired ?? false,
    pickupAddress: data.pickupAddress?.trim() ?? null,
    pickupDate: data.pickupDate ?? null,
    pickupTime: data.pickupTime ?? null,
    totalSamples: data.samples.length,
    receivedSamples: 0,
    completedSamples: 0,
    status: "submitted",
    note: data.note?.trim() ?? null,
    internalNote: null,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
    receivedAt: null,
    completedAt: null,
  });

  for (const sample of data.samples) {
    const sampleRef = db.collection("b2bBatchSamples").doc();
    batch.set(sampleRef, {
      batchId: batchRef.id,
      batchCode,
      organizationId: caller.organizationId,
      patientName: sample.patientName.trim(),
      patientCode: sample.patientCode?.trim() ?? null,
      patientPhone: sample.patientPhone?.trim() ?? null,
      patientDob: sample.patientDob ?? null,
      patientGender: sample.patientGender ?? "unknown",
      sampleBarcode: null,
      sampleType: sample.sampleType.trim(),
      requestedTestIds: sample.requestedTestIds ?? [],
      requestedPackageIds: sample.requestedPackageIds ?? [],
      partnerSampleReference: sample.partnerSampleReference?.trim() ?? null,
      collectionDate: null,
      receivedAt: null,
      status: "registered",
      rejectionReason: null,
      resultId: null,
      resultStatus: "not_started",
      note: sample.note?.trim() ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();

  await writeAuditLog(
    caller.id,
    caller.role,
    "batch_created",
    "b2bBatch",
    batchRef.id,
    { batchCode, sampleCount: data.samples.length },
    caller.organizationId
  );

  return { batchId: batchRef.id, batchCode };
});
