"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  LayoutDashboard,
  Layers,
  PlusCircle,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

const NAV = [
  { href: "/partner", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/partner/batches", icon: Layers, label: "My Batches" },
  { href: "/partner/batches/new", icon: PlusCircle, label: "New Batch" },
  { href: "/partner/results", icon: FileText, label: "Results" },
];

const BOTTOM_NAV = [
  { href: "/partner/settings", icon: Settings, label: "Settings" },
  { href: "/partner/support", icon: HelpCircle, label: "Support" },
];

interface PartnerSidebarProps {
  locale: string;
}

export function PartnerSidebar({ locale }: PartnerSidebarProps) {
  const pathname = usePathname();
  const { appUser, logout } = useAuth();

  function isActive(href: string, exact = false) {
    const full = `/${locale}${href}`;
    return exact ? pathname === full : pathname.startsWith(full);
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 font-bold text-sky-600 text-lg border-b border-slate-100">
        <FlaskConical className="h-5 w-5" />
        OLabo
        <span className="ml-auto text-xs font-normal text-slate-400">Partner</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-sky-50 text-sky-600 font-medium border-l-2 border-sky-500"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col gap-0.5 border-t border-slate-100 p-3">
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        {/* Avatar */}
        {appUser && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 text-xs font-bold">
              {appUser.displayName?.[0]?.toUpperCase() ?? "P"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-800">{appUser.displayName}</p>
              <p className="truncate text-xs text-slate-400">{appUser.organizationName}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
