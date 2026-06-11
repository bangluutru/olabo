/**
 * Seed mock data for OLabo development / emulator.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx ts-node scripts/seedMockData.ts
 *
 * For emulator:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node scripts/seedMockData.ts
 */

import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "demo-olabo" });
}

const db = admin.firestore();

async function seed() {
  console.log("🌱 Seeding OLabo mock data...");

  // ─── Organizations ────────────────────────────────────────────────────────
  const orgs = [
    { id: "org1", name: "City Clinic", type: "clinic", contactName: "Dr. Nguyen Van A", contactPhone: "0912345678", contactEmail: "admin@cityclinic.vn", address: "123 Nguyen Hue, Hanoi", isActive: true },
    { id: "org2", name: "General Hospital", type: "hospital", contactName: "Ms. Tran Thi Lan", contactPhone: "0987654321", contactEmail: "lab@generalhospital.vn", address: "456 Le Loi, HCMC", isActive: true },
  ];

  for (const org of orgs) {
    const { id, ...data } = org;
    await db.collection("organizations").doc(id).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ Organization: ${org.name}`);
  }

  // ─── Users ────────────────────────────────────────────────────────────────
  const users = [
    { id: "admin1", email: "admin@olabo.com", displayName: "Admin User", role: "admin", isActive: true },
    { id: "staff1", email: "staff@olabo.com", displayName: "Lab Staff", role: "staff", isActive: true },
    { id: "doctor1", email: "doctor@olabo.com", displayName: "Dr. Smith", role: "doctor", isActive: true },
    { id: "partner1", email: "partner@cityclinic.vn", displayName: "Dr. Nguyen Van A", role: "partner", organizationId: "org1", organizationName: "City Clinic", isActive: true },
    { id: "partner2", email: "partner@generalhospital.vn", displayName: "Ms. Tran Thi Lan", role: "partner", organizationId: "org2", organizationName: "General Hospital", isActive: true },
  ];

  for (const user of users) {
    const { id, ...data } = user;
    await db.collection("users").doc(id).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ User: ${user.displayName} (${user.role})`);
  }

  // ─── Lab Tests ────────────────────────────────────────────────────────────
  const tests = [
    { id: "cbc", code: "CBC", name: "Complete Blood Count", nameVi: "Công thức máu toàn phần", nameLo: "ນັບເລືອດທັງໝົດ", category: "Hematology", sampleType: "Blood", turnaroundHours: 4, price: 150000, isActive: true },
    { id: "lft", code: "LFT", name: "Liver Function Test", nameVi: "Chức năng gan", nameLo: "ທົດສອບຕັບ", category: "Biochemistry", sampleType: "Blood", turnaroundHours: 6, price: 280000, isActive: true },
    { id: "kft", code: "KFT", name: "Kidney Function Test", nameVi: "Chức năng thận", nameLo: "ທົດສອບໄຕ", category: "Biochemistry", sampleType: "Blood", turnaroundHours: 6, price: 260000, isActive: true },
    { id: "tsh", code: "TSH", name: "Thyroid TSH", nameVi: "TSH tuyến giáp", nameLo: "TSH ຕ່ອມ", category: "Hormones", sampleType: "Blood", turnaroundHours: 8, price: 320000, isActive: true },
  ];

  for (const test of tests) {
    const { id, ...data } = test;
    await db.collection("labTests").doc(id).set(data);
  }
  console.log(`  ✓ ${tests.length} lab tests seeded`);

  // ─── B2B Batches & Samples ────────────────────────────────────────────────
  const batchDefs = [
    {
      id: "batch1",
      orgId: "org1",
      batchCode: "B-20240601-A1B2",
      status: "partially_completed",
      partnerRef: "CLINIC-2024-06-01",
      pickupRequired: true,
    },
    {
      id: "batch2",
      orgId: "org1",
      batchCode: "B-20240525-C3D4",
      status: "completed",
      partnerRef: null,
      pickupRequired: false,
    },
    {
      id: "batch3",
      orgId: "org2",
      batchCode: "B-20240610-E5F6",
      status: "processing",
      partnerRef: "HOSPITAL-JUN",
      pickupRequired: false,
    },
  ];

  for (const def of batchDefs) {
    const sampleStatuses = def.status === "completed"
      ? ["result_released", "result_released", "result_released"]
      : def.status === "partially_completed"
        ? ["result_released", "result_ready", "processing", "rejected"]
        : ["processing", "processing", "registered"];

    await db.collection("b2bBatches").doc(def.id).set({
      batchCode: def.batchCode,
      organizationId: def.orgId,
      organizationName: def.orgId === "org1" ? "City Clinic" : "General Hospital",
      createdBy: def.orgId === "org1" ? "partner1" : "partner2",
      submittedByName: def.orgId === "org1" ? "Dr. Nguyen Van A" : "Ms. Tran Thi Lan",
      submittedByPhone: def.orgId === "org1" ? "0912345678" : "0987654321",
      partnerReferenceCode: def.partnerRef,
      samplePickupRequired: def.pickupRequired,
      pickupAddress: def.pickupRequired ? "123 Nguyen Hue, Hanoi" : null,
      pickupDate: def.pickupRequired ? "2024-06-02" : null,
      pickupTime: def.pickupRequired ? "09:00" : null,
      totalSamples: sampleStatuses.length,
      receivedSamples: sampleStatuses.filter((s) => s !== "registered").length,
      completedSamples: sampleStatuses.filter((s) => s === "result_released" || s === "result_ready").length,
      status: def.status,
      note: null,
      internalNote: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      receivedAt: def.status !== "registered" ? admin.firestore.FieldValue.serverTimestamp() : null,
      completedAt: def.status === "completed" ? admin.firestore.FieldValue.serverTimestamp() : null,
    });

    for (let i = 0; i < sampleStatuses.length; i++) {
      const sStatus = sampleStatuses[i];
      const rStatus = sStatus === "result_released" ? "released" : sStatus === "result_ready" ? "ready" : sStatus === "processing" ? "pending" : "not_started";
      const resultId = (sStatus === "result_released" || sStatus === "result_ready") ? `result-${def.id}-${i}` : null;

      await db.collection("b2bBatchSamples").add({
        batchId: def.id,
        batchCode: def.batchCode,
        organizationId: def.orgId,
        patientName: ["Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D"][i] ?? `Patient ${i + 1}`,
        patientCode: `P${String(i + 1).padStart(3, "0")}`,
        patientPhone: null,
        patientDob: ["1985-03-12", "1990-07-22", null, "1975-11-30"][i] ?? null,
        patientGender: ["male", "female", "male", "female"][i] ?? "unknown",
        sampleBarcode: sStatus !== "registered" ? `OL${def.batchCode.slice(-4)}${String(i + 1).padStart(3, "0")}` : null,
        sampleType: "blood",
        requestedTestIds: i % 2 === 0 ? ["cbc", "lft"] : ["tsh"],
        requestedPackageIds: [],
        partnerSampleReference: i === 0 ? `${def.partnerRef ?? "REF"}-P${i + 1}` : null,
        collectionDate: "2024-06-02",
        receivedAt: sStatus !== "registered" ? "2024-06-02" : null,
        status: sStatus,
        rejectionReason: sStatus === "rejected" ? "Sample degraded — hemolysis" : null,
        resultId,
        resultStatus: rStatus,
        note: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (resultId) {
        await db.collection("results").doc(resultId).set({
          resultCode: `R-20240603-${resultId.slice(-4).toUpperCase()}`,
          resultScope: "b2b",
          batchId: def.id,
          batchSampleId: resultId,
          organizationId: def.orgId,
          patientName: ["Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D"][i] ?? `Patient ${i + 1}`,
          patientCode: `P${String(i + 1).padStart(3, "0")}`,
          sampleBarcode: `OL${def.batchCode.slice(-4)}${String(i + 1).padStart(3, "0")}`,
          testSummary: "CBC, LFT — All within normal range",
          pdfStoragePath: `results/b2b/${def.orgId}/${def.id}/${resultId}.pdf`,
          status: rStatus,
          releasedAt: rStatus === "released" ? admin.firestore.FieldValue.serverTimestamp() : null,
          releasedBy: rStatus === "released" ? "doctor1" : null,
          viewedAt: null,
          downloadedAt: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    console.log(`  ✓ Batch ${def.batchCode} + ${sampleStatuses.length} samples`);
  }

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
