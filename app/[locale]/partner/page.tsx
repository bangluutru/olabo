"use client";

import Link from "next/link";
import { Layers, Clock, CheckCircle, Download, ArrowRight, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BatchProgressBar } from "@/components/shared/BatchProgressBar";
import { formatRelative } from "@/lib/utils";
import { use, useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import type { B2BBatch } from "@/types";

export default function PartnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { appUser: user } = useAuth();
  const [recentBatches, setRecentBatches] = useState<B2BBatch[]>([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0, readyToDownload: 0 });

  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(
      collection(db, "b2bBatches"),
      where("organizationId", "==", user.organizationId),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      const batches = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as B2BBatch);
      setRecentBatches(batches);
    });
    return unsub;
  }, [user?.organizationId]);

  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(
      collection(db, "b2bBatches"),
      where("organizationId", "==", user.organizationId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const batches = snap.docs.map((d) => d.data() as B2BBatch);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      setStats({
        total: batches.length,
        processing: batches.filter((b) => b.status === "processing" || b.status === "partially_completed").length,
        completed: batches.filter((b) => {
          if (b.status !== "completed" || !b.completedAt) return false;
          const ts = (b.completedAt as { toDate?: () => Date }).toDate?.();
          return ts ? ts >= monthStart : false;
        }).length,
        readyToDownload: batches.filter((b) => b.completedSamples > 0).length,
      });
    });
    return unsub;
  }, [user?.organizationId]);

  const STAT_CARDS = [
    { label: "Total Batches", value: stats.total, icon: Layers, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Processing", value: stats.processing, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed This Month", value: stats.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Ready to Download", value: stats.readyToDownload, icon: Download, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Button asChild>
          <Link href={`/${locale}/partner/batches/new`}>
            <PlusCircle className="h-4 w-4" />
            New Batch
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent batches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Batches</h2>
          <Link href={`/${locale}/partner/batches`} className="flex items-center gap-1 text-sm text-sky-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Batch Code", "Partner Ref", "Submitted", "Progress", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      No batches yet. Create your first batch to get started!
                    </td>
                  </tr>
                ) : (
                  recentBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-sky-700">{batch.batchCode}</td>
                      <td className="px-4 py-3 text-slate-500">{batch.partnerReferenceCode ?? <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-slate-500">{batch.submittedAt ? formatRelative(batch.submittedAt) : "—"}</td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <BatchProgressBar completed={batch.completedSamples} total={batch.totalSamples} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={batch.status} /></td>
                      <td className="px-4 py-3">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/${locale}/partner/batches/${batch.id}`}>View →</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-16 justify-start gap-4 px-6">
          <Link href={`/${locale}/partner/batches/new`}>
            <PlusCircle className="h-6 w-6 text-sky-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-800">Create New Batch</p>
              <p className="text-xs text-slate-400">Submit multiple samples at once</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 justify-start gap-4 px-6">
          <Link href={`/${locale}/partner/results`}>
            <Download className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-800">View Results</p>
              <p className="text-xs text-slate-400">Download ready results</p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
