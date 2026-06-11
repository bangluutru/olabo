import Papa from "papaparse";
import type { CsvSampleRow, ParsedCsvRow } from "@/types";

const VALID_GENDERS = new Set(["male", "female", "other", "unknown"]);

export function parseBatchCsv(file: File): Promise<ParsedCsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvSampleRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedCsvRow[] = results.data.map((row, i) => {
          const errors: string[] = [];
          if (!row.patientName?.trim()) errors.push("patientName is required");
          if (!row.sampleType?.trim()) errors.push("sampleType is required");
          if (row.patientGender && !VALID_GENDERS.has(row.patientGender.toLowerCase())) {
            errors.push("patientGender must be: male, female, other, or unknown");
          }
          return {
            rowIndex: i + 2,
            data: {
              ...row,
              patientGender: row.patientGender?.toLowerCase() || "unknown",
            },
            isValid: errors.length === 0,
            errors,
          };
        });
        resolve(parsed);
      },
      error: reject,
    });
  });
}

export function generateCsvTemplate(): string {
  const headers = [
    "patientName",
    "patientCode",
    "patientPhone",
    "patientDob",
    "patientGender",
    "sampleType",
    "requestedTestCodes",
    "requestedPackageCodes",
    "partnerSampleReference",
    "note",
  ];
  const exampleRow = [
    "Nguyen Van A",
    "P001",
    "0912345678",
    "1990-01-15",
    "male",
    "blood",
    "CBC;LFT",
    "PKG-BASIC",
    "CLINIC-REF-001",
    "",
  ];
  return [headers.join(","), exampleRow.join(",")].join("\n");
}
