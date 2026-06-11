"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  LayoutDashboard,
  Layers,
  TestTube,
  ClipboardList,
  FileText,
  Users,
  Building2,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/bookings", icon: ClipboardList, label: "Bookings (B2C)" },
  { href: "/admin/b2b-batches", icon: Layers, label: "B2B Batches" },
  { href: "/admin/b2b-samples", icon: TestTube, label: "B2B Samples" },
  { href: "/admin/results", icon: FileText, label: "Results" },
  { href: "/admin/users", icon: Users, label: "Users & Roles" },
  { href: "/admin/organizations", icon: Building2, label: "Organizations" },
  { href: "/admin/audit-logs", icon: ScrollText, label: "Audit Logs" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminSidebarProps {
  locale: string;
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const { appUser, logout } = useAuth();

  function isActive(href: string, exact = false) {
    const full = `/${locale}${href}`;
    return exact ? pathname === full : pathname.startsWith(full);
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 font-bold text-white text-lg border-b border-slate-800">
        <FlaskConical className="h-5 w-5 text-sky-400" />
        <span className="text-white">OLabo</span>
        <span className="ml-auto text-xs font-normal text-slate-400">Admin</span>
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
                ? "bg-slate-800 text-white font-medium border-l-2 border-sky-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        {appUser && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-900 text-sky-400 text-xs font-bold">
              {appUser.displayName?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{appUser.displayName}</p>
              <p className="truncate text-xs text-slate-400 capitalize">{appUser.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
