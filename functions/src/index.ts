import * as admin from "firebase-admin";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp();
}

export { partnerCreateBatch } from "./b2b/partnerCreateBatch";
export { partnerGetBatchDetails } from "./b2b/partnerGetBatchDetails";
export { partnerDownloadResultPdf } from "./b2b/partnerDownloadResultPdf";
export { partnerDownloadBatchZip } from "./b2b/partnerDownloadBatchZip";
export { partnerExportBatchCsv } from "./b2b/partnerExportBatchCsv";
export { adminUpdateBatchStatus } from "./b2b/adminUpdateBatchStatus";
export { adminUpdateBatchSampleStatus } from "./b2b/adminUpdateBatchSampleStatus";
export { adminUploadSampleResult } from "./b2b/adminUploadSampleResult";
export { adminReleaseResult } from "./b2b/adminReleaseResult";
