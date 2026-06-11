"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Input } from "@/components/ui/input";
import { use } from "react";

const CATEGORIES = ["All", "Hematology", "Biochemistry", "Immunology", "Hormones", "Packages"];

const TESTS = [
  { code: "CBC", name: "Complete Blood Count", category: "Hematology", sampleType: "Blood", turnaround: "4h", price: 150000 },
  { code: "WBC-DIFF", name: "WBC Differential", category: "Hematology", sampleType: "Blood", turnaround: "4h", price: 120000 },
  { code: "LFT", name: "Liver Function Test", category: "Biochemistry", sampleType: "Blood", turnaround: "6h", price: 280000 },
  { code: "KFT", name: "Kidney Function Test", category: "Biochemistry", sampleType: "Blood", turnaround: "6h", price: 260000 },
  { code: "LIPID", name: "Lipid Profile", category: "Biochemistry", sampleType: "Blood", turnaround: "6h", price: 220000 },
  { code: "FBS", name: "Fasting Blood Sugar", category: "Biochemistry", sampleType: "Blood", turnaround: "2h", price: 80000 },
  { code: "HBA1C", name: "HbA1c", category: "Biochemistry", sampleType: "Blood", turnaround: "6h", price: 180000 },
  { code: "TSH", name: "Thyroid Stimulating Hormone", category: "Hormones", sampleType: "Blood", turnaround: "8h", price: 320000 },
  { code: "FT3", name: "Free T3", category: "Hormones", sampleType: "Blood", turnaround: "8h", price: 280000 },
  { code: "FT4", name: "Free T4", category: "Hormones", sampleType: "Blood", turnaround: "8h", price: 280000 },
  { code: "HBsAg", name: "Hepatitis B Surface Antigen", category: "Immunology", sampleType: "Blood", turnaround: "4h", price: 150000 },
  { code: "AntiHCV", name: "Anti-HCV Antibody", category: "Immunology", sampleType: "Blood", turnaround: "4h", price: 180000 },
  { code: "PKG-BASIC", name: "Basic Health Check Package", category: "Packages", sampleType: "Blood", turnaround: "1 day", price: 490000 },
  { code: "PKG-COMP", name: "Comprehensive Health Package", category: "Packages", sampleType: "Blood", turnaround: "1 day", price: 980000 },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function PricesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = TESTS.filter((t) => {
    const matchesCat = category === "All" || t.category === category;
    const q = search.toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader locale={locale} />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Price List</h1>
          <p className="mt-1 text-slate-500">All prices include sample collection fee</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search by test name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-sky-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-sky-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Code", "Test Name", "Category", "Sample Type", "Turnaround", "Price"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((test) => (
                <tr key={test.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{test.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{test.name}</td>
                  <td className="px-4 py-3 text-slate-500">{test.category}</td>
                  <td className="px-4 py-3 text-slate-500">{test.sampleType}</td>
                  <td className="px-4 py-3 text-slate-500">{test.turnaround}</td>
                  <td className="px-4 py-3 font-semibold text-sky-700">{formatPrice(test.price)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No tests found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
