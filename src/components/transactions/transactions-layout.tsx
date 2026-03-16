"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { List, Merge, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const TABS: { key: string; href: string; label: string; icon: typeof List; feature?: FeatureKey }[] = [
  { key: "list", href: "/transactions", label: "List", icon: List },
  { key: "merge", href: "/transactions/merge", label: "Merge", icon: Merge, feature: "transactionMerge" },
  { key: "manage", href: "/transactions/manage", label: "Manage", icon: SlidersHorizontal },
  { key: "prices", href: "/transactions/prices", label: "Prices", icon: TrendingUp, feature: "priceAnalysis" },
];

export function TransactionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleTabs = TABS.filter(
    (tab) => !tab.feature || settings.isAdmin || settings.featureFlags[tab.feature]
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {visibleTabs.map((tab) => {
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
