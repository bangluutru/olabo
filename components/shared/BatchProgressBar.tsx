"use client";

import { cn } from "@/lib/utils";

interface BatchProgressBarProps {
  completed: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export function BatchProgressBar({ completed, total, className, showLabel = true }: BatchProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const color = pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-sky-500" : "bg-orange-400";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {showLabel && (
        <span className="text-xs text-slate-500">
          {completed} / {total} samples
        </span>
      )}
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={cn("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
