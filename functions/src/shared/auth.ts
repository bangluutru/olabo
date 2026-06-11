import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import type { AppUser, UserRole } from "./types";

export async function resolveCallerPartner(uid: string): Promise<AppUser> {
  const snap = await getFirestore().collection("users").doc(uid).get();
  if (!snap.exists) throw new HttpsError("unauthenticated", "User not found");
  const user = { id: snap.id, ...snap.data() } as AppUser;
  if (user.role !== "partner") throw new HttpsError("permission-denied", "Partner role required");
  if (!user.isActive) throw new HttpsError("permission-denied", "Account is inactive");
  if (!user.organizationId) throw new HttpsError("internal", "Partner has no organizationId");
  return user;
}

export async function resolveCallerAdmin(uid: string, allowedRoles: UserRole[] = ["admin", "staff", "doctor"]): Promise<AppUser> {
  const snap = await getFirestore().collection("users").doc(uid).get();
  if (!snap.exists) throw new HttpsError("unauthenticated", "User not found");
  const user = { id: snap.id, ...snap.data() } as AppUser;
  if (!allowedRoles.includes(user.role)) {
    throw new HttpsError("permission-denied", `Role must be one of: ${allowedRoles.join(", ")}`);
  }
  if (!user.isActive) throw new HttpsError("permission-denied", "Account is inactive");
  return user;
}

export function generateBatchCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `B-${date}-${rand}`;
}

export async function writeAuditLog(
  actorId: string,
  actorRole: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>,
  organizationId?: string
): Promise<void> {
  await getFirestore().collection("auditLogs").add({
    actorId,
    actorRole,
    action,
    resourceType,
    resourceId,
    organizationId: organizationId ?? null,
    metadata: metadata ?? {},
    createdAt: FieldValue.serverTimestamp(),
  });
}
