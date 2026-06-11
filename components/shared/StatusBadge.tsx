"use client";

import { Badge } from "@/components/ui/badge";
import type { BatchStatus, SampleStatus, ResultStatus } from "@/types";

type AnyStatus = BatchStatus | SampleStatus | ResultStatus;

const STATUS_CONFIG: Record<AnyStatus, { label: string; variant: "default" | "blue" | "cyan" | "purple" | "orange" | "yellow" | "green" | "red" | "emerald" }> = {
  // Batch statuses
  draft: { label: "Draft", variant: "default" },
  submitted: { label: "Submitted", variant: "blue" },
  pickup_scheduled: { label: "Pickup Scheduled", variant: "cyan" },
  received: { label: "Received", variant: "purple" },
  processing: { label: "Processing", variant: "orange" },
  partially_completed: { label: "Partially Completed", variant: "yellow" },
  completed: { label: "Completed", variant: "green" },
  cancelled: { label: "Cancelled", variant: "red" },
  // Sample statuses
  registered: { label: "Registered", variant: "default" },
  rejected: { label: "Rejected", variant: "red" },
  result_ready: { label: "Result Ready", variant: "emerald" },
  result_released: { label: "Released", variant: "green" },
  // Result statuses
  not_started: { label: "Not Started", variant: "default" },
  pending: { label: "Pending", variant: "orange" },
  ready: { label: "Ready", variant: "emerald" },
  review_required: { label: "Review Required", variant: "yellow" },
  released: { label: "Released", variant: "green" },
};

interface StatusBadgeProps {
  status: AnyStatus;
  labelOverride?: string;
  className?: string;
}

export function StatusBadge({ status, labelOverride, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {labelOverride ?? config.label}
    </Badge>
  );
}
