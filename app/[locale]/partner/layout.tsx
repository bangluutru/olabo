"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PartnerSidebar } from "@/components/shared/PartnerSidebar";
import { useAuth } from "@/lib/hooks/useAuth";

export default function PartnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || appUser.role !== "partner")) {
      router.replace(`/${params.locale}/login/partner`);
    }
  }, [appUser, loading, router, params.locale]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  if (!appUser || appUser.role !== "partner") return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <PartnerSidebar locale={params.locale} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
