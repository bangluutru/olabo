"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ChevronRight } from "lucide-react";
import { use } from "react";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Select Tests", "Patient Info", "Schedule", "Confirm"];

const TESTS = [
  { id: "cbc", code: "CBC", name: "Complete Blood Count", price: 150000 },
  { id: "lft", code: "LFT", name: "Liver Function Test", price: 280000 },
  { id: "kft", code: "KFT", name: "Kidney Function Test", price: 260000 },
  { id: "lipid", code: "LIPID", name: "Lipid Profile", price: 220000 },
  { id: "fbs", code: "FBS", name: "Fasting Blood Sugar", price: 80000 },
  { id: "tsh", code: "TSH", name: "Thyroid TSH", price: 320000 },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [step, setStep] = useState(0);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", phone: "", dob: "", gender: "unknown",
    address: "", date: "", time: "", homeCollection: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [bookingCode] = useState("BK-" + Math.random().toString(36).substring(2, 8).toUpperCase());

  function toggleTest(id: string) {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  const total = TESTS.filter((t) => selectedTests.includes(t.id)).reduce((s, t) => s + t.price, 0);

  async function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader locale={locale} />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-6">We&apos;ll contact you shortly to confirm your appointment.</p>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Your booking code</p>
              <p className="text-2xl font-mono font-bold text-sky-600 mt-1">{bookingCode}</p>
              <p className="text-xs text-slate-400 mt-2">Save this code to look up your results later</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader locale={locale} />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-slate-900">Book a Test</h1>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-500"
                )}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block", i === step ? "font-medium text-slate-800" : "text-slate-400")}>
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />}
            </div>
          ))}
        </div>

        {/* Step 0: Select Tests */}
        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Select Tests</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {TESTS.map((test) => (
                  <label key={test.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors",
                    selectedTests.includes(test.id) ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-slate-300"
                  )}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => toggleTest(test.id)}
                        className="accent-sky-600"
                      />
                      <div>
                        <span className="font-mono text-xs text-slate-400">{test.code}</span>
                        <p className="text-sm font-medium text-slate-800">{test.name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-sky-700">{formatPrice(test.price)}</span>
                  </label>
                ))}
              </div>
              {total > 0 && (
                <div className="mt-4 flex justify-between rounded-lg bg-sky-50 p-4 font-semibold text-sky-800">
                  <span>Total ({selectedTests.length} tests)</span>
                  <span>{formatPrice(total)}</span>
                </div>
              )}
              <Button className="mt-4 w-full" disabled={selectedTests.length === 0} onClick={() => setStep(1)}>
                Continue →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Patient Info */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Phone Number" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Gender</label>
                  <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Prefer not to say</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <input type="checkbox" id="home" checked={form.homeCollection} onChange={(e) => setForm({ ...form, homeCollection: e.target.checked })} className="accent-sky-600" />
                  <div>
                    <label htmlFor="home" className="text-sm font-medium text-slate-800 cursor-pointer">Home Collection</label>
                    <p className="text-xs text-slate-400">Staff will collect at your address</p>
                  </div>
                </div>
                {form.homeCollection && (
                  <Input label="Collection Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
                <Button className="flex-1" disabled={!form.name || !form.phone} onClick={() => setStep(2)}>
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Schedule Appointment</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Input label="Preferred Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Preferred Time</label>
                  <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                    <option value="">Select time slot</option>
                    {["07:00", "08:00", "09:00", "10:00", "13:00", "14:00", "15:00", "16:00"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button className="flex-1" disabled={!form.date || !form.time} onClick={() => setStep(3)}>
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Confirm Booking</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {[
                  ["Patient", form.name],
                  ["Phone", form.phone],
                  ["Gender", form.gender],
                  ["Tests", TESTS.filter((t) => selectedTests.includes(t.id)).map((t) => t.name).join(", ")],
                  ["Date", form.date],
                  ["Time", form.time],
                  ["Collection", form.homeCollection ? `Home — ${form.address}` : "Clinic walk-in"],
                  ["Total", formatPrice(total)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button className="flex-1" onClick={handleSubmit}>Confirm Booking ✓</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
