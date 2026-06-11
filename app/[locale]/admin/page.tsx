"use client";

import { Layers, Calendar, TestTube, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  { label: "B2B Batches Today", value: "4", icon: Layers, color: "text-sky-600", bg: "bg-sky-50", delta: "+2" },
  { label: "B2C Bookings Today", value: "12", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", delta: "+5" },
  { label: "Samples Processing", value: "38", icon: TestTube, color: "text-orange-600", bg: "bg-orange-50", delta: null },
  { label: "Results Released Today", value: "29", icon: FileText, color: "text-green-600", bg: "bg-green-50", delta: "+8" },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                  {stat.delta && <p className="text-xs text-green-600 mt-0.5">{stat.delta} from yesterday</p>}
                </div>
                <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
        Charts, recent activity feed, and quick-action shortcuts go here
      </div>
    </div>
  );
}
