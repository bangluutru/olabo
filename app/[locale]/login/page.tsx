"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/useAuth";
import { use } from "react";
import Link from "next/link";

export default function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { signIn, appUser } = useAuth();
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
      router.push(`/${locale}/admin`);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500">
            <FlaskConical className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">OLabo</h1>
          <p className="mt-1 text-slate-400 text-sm">Admin Portal</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Sign In</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="admin@olabo.com"
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
            <div className="mt-4 text-center">
              <Link href={`/${locale}/login/partner`} className="text-sm text-sky-500 hover:underline">
                Partner Login →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
