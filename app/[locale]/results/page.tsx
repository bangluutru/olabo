"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { Search, FileText } from "lucide-react";
import { use } from "react";
import type { ResultStatus } from "@/types";

interface LookupResult {
  id: string;
  patientName: string;
  testSummary: string;
  status: ResultStatus;
  resultDate: string;
}

export default function ResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);
    // Mock lookup — replace with Firestore query
    await new Promise((r) => setTimeout(r, 800));
    if (phone === "0912345678" && code === "R-20240601-DEMO") {
      setResult({
        id: "demo-result",
        patientName: "Nguyen Van A",
        testSummary: "CBC, LFT — All within normal range",
        status: "released",
        resultDate: "01/06/2024",
      });
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader locale={locale} />
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
            <FileText className="h-7 w-7 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Look Up Your Results</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your phone number and result code to access your results
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              <Input
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="Your registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Result Code"
                id="code"
                placeholder="e.g. R-20240601-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} className="w-full mt-2">
                <Search className="h-4 w-4" />
                Look Up
              </Button>
            </form>

            {notFound && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                No results found. Please check your phone number and result code.
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400">Patient</p>
                  <p className="font-semibold text-slate-900">{result.patientName}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>
              <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Result Date</span>
                  <span>{result.resultDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Summary</span>
                  <span className="text-right max-w-[60%]">{result.testSummary}</span>
                </div>
              </div>
              <div className="mt-4">
                <PdfDownloadButton
                  resultStatus={result.status}
                  onDownload={async () => {
                    await new Promise((r) => setTimeout(r, 1000));
                    alert("PDF download would start here");
                  }}
                  className="w-full justify-center"
                  size="md"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
