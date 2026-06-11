"use client";

import { cn } from "@/lib/utils";
import type { ParsedCsvRow } from "@/types";

interface CsvPreviewTableProps {
  rows: ParsedCsvRow[];
}

const COLUMNS = [
  { key: "patientName", label: "Patient Name" },
  { key: "patientCode", label: "Code" },
  { key: "patientGender", label: "Gender" },
  { key: "sampleType", label: "Sample Type" },
  { key: "requestedTestCodes", label: "Tests" },
  { key: "partnerSampleReference", label: "Partner Ref" },
];

export function CsvPreviewTable({ rows }: CsvPreviewTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-80">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 w-12">
              Row
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                {col.label}
              </th>
            ))}
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.rowIndex}
              className={cn(
                row.isValid ? "bg-white hover:bg-slate-50" : "bg-red-50 border-l-2 border-l-red-400"
              )}
            >
              <td className="px-3 py-2 font-mono text-xs text-slate-400">{row.rowIndex}</td>
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-3 py-2 text-slate-700">
                  {(row.data as unknown as Record<string, string | undefined>)[col.key] || (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-2">
                {row.isValid ? (
                  <span className="text-xs text-green-600 font-medium">✓ Valid</span>
                ) : (
                  <span className="text-xs text-red-600">{row.errors.join(", ")}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
