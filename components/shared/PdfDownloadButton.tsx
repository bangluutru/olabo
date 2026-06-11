"use client";

import { useState } from "react";
import { Download, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResultStatus } from "@/types";

interface PdfDownloadButtonProps {
  resultStatus: ResultStatus;
  onDownload: () => Promise<void>;
  className?: string;
  size?: "sm" | "md";
}

export function PdfDownloadButton({ resultStatus, onDownload, className, size = "sm" }: PdfDownloadButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const isAvailable = resultStatus === "ready" || resultStatus === "released";

  if (!isAvailable) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("text-slate-400", className)}
      >
        <Lock className="h-3.5 w-3.5" />
        Not Ready
      </Button>
    );
  }

  async function handleClick() {
    setState("loading");
    try {
      await onDownload();
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (state === "error") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => setState("idle")}
        className={cn("border-red-300 text-red-600 hover:bg-red-50", className)}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Failed — Retry
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size={size}
      onClick={handleClick}
      loading={state === "loading"}
      className={className}
    >
      {state === "idle" && <Download className="h-3.5 w-3.5" />}
      {state === "loading" ? "Preparing..." : "Download PDF"}
    </Button>
  );
}
