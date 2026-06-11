import { Timestamp } from "firebase/firestore";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "staff" | "doctor" | "partner" | "public";

export type BatchStatus =
  | "draft"
  | "submitted"
  | "pickup_scheduled"
  | "received"
  | "processing"
  | "partially_completed"
  | "completed"
  | "cancelled";

export type SampleStatus =
  | "registered"
  | "received"
  | "rejected"
  | "processing"
  | "result_ready"
  | "result_released"
  | "cancelled";

export type ResultStatus =
  | "not_started"
  | "pending"
  | "ready"
  | "review_required"
  | "released";

export type ResultScope = "b2c" | "b2b";

export type DownloadType = "individual_pdf" | "batch_zip" | "csv_export";

export type Gender = "male" | "female" | "other" | "unknown";

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Organization (B2B Partner) ───────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  type: "clinic" | "hospital" | "pharmacy" | "company" | "other";
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Test & Package ───────────────────────────────────────────────────────────

export interface LabTest {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  nameLo: string;
  category: string;
  sampleType: string;
  turnaroundHours: number;
  price: number;
  isActive: boolean;
}

export interface TestPackage {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  nameLo: string;
  description: string;
  testIds: string[];
  price: number;
  isActive: boolean;
}

// ─── B2C Booking ──────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  bookingCode: string;
  patientName: string;
  patientPhone: string;
  patientDob?: string;
  patientGender: Gender;
  address: string;
  requestedTestIds: string[];
  requestedPackageIds: string[];
  scheduledDate: string;
  scheduledTime: string;
  homeCollection: boolean;
  status: "pending" | "confirmed" | "collected" | "processing" | "completed" | "cancelled";
  resultId?: string;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── B2B Batch ────────────────────────────────────────────────────────────────

export interface B2BBatch {
  id: string;
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
  id: string;
  batchId: string;
  batchCode: string;
  organizationId: string;
  patientName: string;
  patientCode: string | null;
  patientPhone: string | null;
  patientDob: string | null;
  patientGender: Gender;
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

// ─── Result ───────────────────────────────────────────────────────────────────

export interface Result {
  id: string;
  resultCode: string;
  resultScope: ResultScope;
  // B2C fields
  bookingId?: string;
  patientPhone?: string;
  // B2B fields
  batchId: string | null;
  batchSampleId: string | null;
  organizationId: string | null;
  // Shared
  patientName: string;
  patientCode: string | null;
  sampleBarcode: string | null;
  testSummary: string;
  pdfStoragePath: string;
  status: "pending" | "ready" | "review_required" | "released";
  releasedAt: Timestamp | null;
  releasedBy: string | null;
  viewedAt: Timestamp | null;
  downloadedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Result Download Audit ────────────────────────────────────────────────────

export interface ResultDownload {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  organizationId: string | null;
  resultId: string;
  sampleId: string | null;
  batchId: string | null;
  downloadType: DownloadType;
  downloadedAt: Timestamp;
  ipAddress: string | null;
  userAgent: string | null;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}

// ─── CSV Import ───────────────────────────────────────────────────────────────

export interface CsvSampleRow {
  patientName: string;
  patientCode?: string;
  patientPhone?: string;
  patientDob?: string;
  patientGender?: string;
  sampleType: string;
  requestedTestCodes?: string;
  requestedPackageCodes?: string;
  partnerSampleReference?: string;
  note?: string;
}

export interface ParsedCsvRow {
  rowIndex: number;
  data: CsvSampleRow;
  isValid: boolean;
  errors: string[];
}

// ─── Form Input Types ─────────────────────────────────────────────────────────

export interface CreateBatchInput {
  partnerReferenceCode?: string;
  submittedByName: string;
  submittedByPhone: string;
  samplePickupRequired: boolean;
  pickupAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  note?: string;
}

export interface CreateSampleInput {
  patientName: string;
  patientCode?: string;
  patientPhone?: string;
  patientDob?: string;
  patientGender: Gender;
  sampleType: string;
  requestedTestIds: string[];
  requestedPackageIds: string[];
  partnerSampleReference?: string;
  note?: string;
}
