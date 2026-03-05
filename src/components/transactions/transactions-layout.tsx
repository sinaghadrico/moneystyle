"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { List, Merge, SlidersHorizontal, TrendingUp } from "lucide-react";

const TABS = [
  { key: "list", href: "/transactions", label: "List", icon: List },
  { key: "merge", href: "/transactions/merge", label: "Merge", icon: Merge },
  { key: "manage", href: "/transactions/manage", label: "Manage", icon: SlidersHorizontal },
  { key: "prices", href: "/transactions/prices", label: "Prices", icon: TrendingUp },
] as const;

export function TransactionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.key === "list"
              ? pathname === "/transactions" || pathname.startsWith("/transactions?")
              : pathname.startsWith(tab.href);
          return (
            <NextLink
              key={tab.key}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NextLink>
          );
        })}
      </div>

      {children}
    </div>
  );
}
