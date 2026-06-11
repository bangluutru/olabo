"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/useAuth";
import { use } from "react";
import Link from "next/link";

export default function PartnerLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.push(`/${locale}/partner`);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600">
            <FlaskConical className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">OLabo Partner Portal</h1>
          <p className="mt-1 text-slate-500 text-sm">For clinics, hospitals, and corporate partners</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sky-600" />
              <CardTitle>Partner Sign In</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Organization Email"
                id="email"
                type="email"
                placeholder="partner@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" loading={loading} className="w-full mt-2">
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <button className="text-sm text-slate-400 hover:text-slate-600">Forgot password?</button>
              <div>
                <Link href={`/${locale}/login`} className="text-sm text-sky-500 hover:underline">
                  Admin Login →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-400">
          Need a partner account?{" "}
          <a href="mailto:partner@olabo.com" className="text-sky-500 hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
