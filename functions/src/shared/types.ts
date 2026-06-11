import * as admin from "firebase-admin";

export type Timestamp = admin.firestore.Timestamp;

export type UserRole = "admin" | "staff" | "doctor" | "partner" | "public";

export type BatchStatus =
  | "draft" | "submitted" | "pickup_scheduled" | "received"
  | "processing" | "partially_completed" | "completed" | "cancelled";

export type SampleStatus =
  | "registered" | "received" | "rejected" | "processing"
  | "result_ready" | "result_released" | "cancelled";

export type ResultStatus =
  | "not_started" | "pending" | "ready" | "review_required" | "released";

export type DownloadType = "individual_pdf" | "batch_zip" | "csv_export";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
}

export interface B2BBatch {
  batchCode: string;
  organizationId: string;
  organizationName: string;
  createdBy: string;
  submittedByName: string;
  submittedByPhone: string;
  partnerReferenceCode: string | null;
  samplePickupRequired: boolean;
  pickupAddress: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  totalSamples: number;
  receivedSamples: number;
  completedSamples: number;
  status: BatchStatus;
  note: string | null;
  internalNote: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  submittedAt: Timestamp | null;
  receivedAt: Timestamp | null;
  completedAt: Timestamp | null;
}

export interface B2BBatchSample {
  batchId: string;
  batchCode: string;
  organizationId: string;
  patientName: string;
  patientCode: string | null;
  patientPhone: string | null;
  patientDob: string | null;
  patientGender: "male" | "female" | "other" | "unknown";
  sampleBarcode: string | null;
  sampleType: string;
  requestedTestIds: string[];
  requestedPackageIds: string[];
  partnerSampleReference: string | null;
  collectionDate: string | null;
  receivedAt: string | null;
  status: SampleStatus;
  rejectionReason: string | null;
  resultId: string | null;
  resultStatus: ResultStatus;
  note: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SampleInput {
  patientName: string;
  patientCode?: string;
  patientPhone?: string;
  patientDob?: string;
  patientGender?: "male" | "female" | "other" | "unknown";
  sampleType: string;
  requestedTestIds?: string[];
  requestedPackageIds?: string[];
  partnerSampleReference?: string;
  note?: string;
}
