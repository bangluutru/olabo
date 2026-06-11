"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "lo", label: "ລາວ" },
];

const NAV_LINKS = [
  { href: "/booking", label: "Book a Test" },
  { href: "/results", label: "My Results" },
  { href: "/prices", label: "Prices" },
];

export function PublicHeader({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-sky-600 text-lg">
          <FlaskConical className="h-5 w-5" />
          OLabo
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                "text-sm transition-colors hover:text-sky-600",
                pathname.includes(link.href) ? "text-sky-600 font-medium" : "text-slate-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center gap-1 text-xs">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
                className={cn(
                  "px-1.5 py-0.5 rounded transition-colors",
                  locale === loc.code
                    ? "text-sky-600 font-semibold"
                    : "text-slate-500 hover:text-sky-600"
                )}
              >
                {loc.label}
              </button>
            ))}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/${locale}/login/partner`}>Partner Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/${locale}/login`}>Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
