"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { SampleStatus } from "@/types";

const TIMELINE_STEPS: { status: SampleStatus; label: string }[] = [
  { status: "registered", label: "Registered" },
  { status: "received", label: "Received" },
  { status: "processing", label: "Processing" },
  { status: "result_ready", label: "Result Ready" },
  { status: "result_released", label: "Released" },
];

const STATUS_ORDER: Record<SampleStatus, number> = {
  registered: 0,
  received: 1,
  rejected: 1,
  processing: 2,
  result_ready: 3,
  result_released: 4,
  cancelled: -1,
};

interface SampleTimelineProps {
  currentStatus: SampleStatus;
  timestamps?: Partial<Record<SampleStatus, string>>;
}

export function SampleTimeline({ currentStatus, timestamps = {} }: SampleTimelineProps) {
  const currentOrder = STATUS_ORDER[currentStatus] ?? -1;

  if (currentStatus === "cancelled" || currentStatus === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
        <span className="font-medium">
          Sample {currentStatus === "rejected" ? "Rejected" : "Cancelled"}
        </span>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-6">
      {TIMELINE_STEPS.map((step, i) => {
        const stepOrder = STATUS_ORDER[step.status];
        const isDone = currentOrder > stepOrder;
        const isCurrent = currentOrder === stepOrder;
        const isPending = currentOrder < stepOrder;

        return (
          <li key={step.status} className="flex items-start gap-3">
            {/* circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isDone && "border-green-500 bg-green-500 text-white",
                  isCurrent && "border-sky-500 bg-sky-500 text-white ring-4 ring-sky-100",
                  isPending && "border-slate-200 bg-white text-slate-400"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mt-1 h-8 w-0.5",
                    isDone ? "bg-green-300" : "bg-slate-200"
                  )}
                />
              )}
            </div>
            {/* label */}
            <div className="pt-0.5">
              <p className={cn("text-sm font-medium", isPending ? "text-slate-400" : "text-slate-800")}>
                {step.label}
              </p>
              {timestamps[step.status] && (
                <p className="text-xs text-slate-400">{timestamps[step.status]}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
