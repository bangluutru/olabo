"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { useAuth } from "@/lib/hooks/useAuth";

const ADMIN_ROLES = new Set(["admin", "staff", "doctor"]);

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || !ADMIN_ROLES.has(appUser.role))) {
      router.replace(`/${params.locale}/login`);
    }
  }, [appUser, loading, router, params.locale]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  if (!appUser || !ADMIN_ROLES.has(appUser.role)) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar locale={params.locale} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
