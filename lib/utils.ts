import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Timestamp ? date.toDate() : new Date(date as string);
  return format(d, "dd/MM/yyyy");
}

export function formatDateTime(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Timestamp ? date.toDate() : new Date(date as string);
  return format(d, "dd/MM/yyyy HH:mm");
}

export function formatRelative(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Timestamp ? date.toDate() : new Date(date as string);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function generateBatchCode(): string {
  const date = format(new Date(), "yyyyMMdd");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `B-${date}-${rand}`;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
