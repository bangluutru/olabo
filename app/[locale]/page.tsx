import Link from "next/link";
import { FlaskConical, Home, Zap, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { PublicHeader } from "@/components/shared/PublicHeader";

const FEATURES = [
  {
    icon: Home,
    title: "Home Sample Collection",
    desc: "Certified staff collect samples at your location",
  },
  {
    icon: Zap,
    title: "Fast Results",
    desc: "Most results delivered within 24–48 hours",
  },
  {
    icon: Shield,
    title: "Secure Access",
    desc: "Access your results privately with a personal code",
  },
];

const STEPS = [
  { step: "01", title: "Book Online", desc: "Choose your tests and schedule a collection time." },
  { step: "02", title: "Sample Collection", desc: "Our certified staff visits and collects your sample." },
  { step: "03", title: "Get Results", desc: "Download your secure PDF results anytime." },
];

const POPULAR_TESTS = [
  { code: "CBC", name: "Complete Blood Count", price: "150,000 đ", turnaround: "4h" },
  { code: "LFT", name: "Liver Function Test", price: "280,000 đ", turnaround: "6h" },
  { code: "KFT", name: "Kidney Function Test", price: "260,000 đ", turnaround: "6h" },
  { code: "LIPID", name: "Lipid Profile", price: "220,000 đ", turnaround: "6h" },
  { code: "FBS", name: "Fasting Blood Sugar", price: "80,000 đ", turnaround: "2h" },
  { code: "TSH", name: "Thyroid Stimulating Hormone", price: "320,000 đ", turnaround: "8h" },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader locale={locale} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                <CheckCircle className="h-3.5 w-3.5" />
                ISO Certified Laboratory
              </div>
              <h1 className="mb-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                Home Blood Testing —{" "}
                <span className="text-sky-600">Fast, Accurate Results</span>
              </h1>
              <p className="mb-8 text-lg text-slate-600">
                Book a test online, we collect at your door. Secure results delivered digitally in 24–48 hours.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/booking`}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
                >
                  Book a Test
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/prices`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Price List
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-72 w-72 rounded-full bg-sky-100 flex items-center justify-center">
                  <FlaskConical className="h-40 w-40 text-sky-300" strokeWidth={0.8} />
                </div>
                <div className="absolute -top-4 -right-4 rounded-2xl bg-green-50 border border-green-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-slate-500">Results ready</p>
                  <p className="text-sm font-bold text-green-600">✓ CBC — Normal</p>
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-slate-500">Sample collected</p>
                  <p className="text-sm font-bold text-sky-600">Today 9:30 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50">
                  <f.icon className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tests */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Popular Tests</h2>
            <p className="mt-2 text-slate-500">Most frequently ordered blood tests</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_TESTS.map((test) => (
              <div key={test.code} className="flex items-center justify-between rounded-xl bg-white border border-slate-100 p-5 shadow-sm hover:border-sky-200 transition-colors">
                <div>
                  <span className="text-xs font-mono text-slate-400">{test.code}</span>
                  <p className="font-medium text-slate-800 text-sm">{test.name}</p>
                  <p className="text-xs text-slate-400">⏱ {test.turnaround}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sky-700 text-sm">{test.price}</p>
                  <Link href={`/${locale}/booking`} className="text-xs text-sky-500 hover:underline">
                    Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${locale}/prices`} className="text-sm text-sky-600 hover:underline">
              View full price list →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-2 text-slate-500">Simple 3-step process</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white text-xl font-bold">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B CTA */}
      <section className="py-16 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Are you a clinic, hospital, or corporate partner?
          </h2>
          <p className="mb-8 text-slate-400">
            Submit batches of patient samples and manage results for your entire organization through our dedicated partner portal.
          </p>
          <Link
            href={`/${locale}/login/partner`}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-8 py-3 font-semibold text-white hover:bg-sky-400 transition-colors"
          >
            Access Partner Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-sky-600">
            <FlaskConical className="h-4 w-4" />
            OLabo
          </div>
          <p>© {new Date().getFullYear()} OLabo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
