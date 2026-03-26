"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { BarChart3, TrendingUp, CreditCard, Target, CalendarDays, Repeat, Users } from "lucide-react";
import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const FINANCE_TABS: { key: string; href: string; label: string; icon: React.ElementType; feature?: FeatureKey }[] = [
  { key: "overview", href: "/profile", label: "Overview", icon: BarChart3 },
  { key: "income", href: "/profile/income", label: "Income & Saving", icon: TrendingUp, feature: "profileIncome" },
  { key: "payments", href: "/profile/payments", label: "Payments", icon: CreditCard, feature: "profilePayments" },
  { key: "subscriptions", href: "/profile/subscriptions", label: "Subscriptions", icon: Repeat, feature: "profileSubscriptions" },
  { key: "cashflow", href: "/profile/cashflow", label: "Cashflow", icon: CalendarDays, feature: "profileCashflow" },
  { key: "goals", href: "/profile/goals", label: "Goals", icon: Target, feature: "profileGoals" },
  { key: "household", href: "/profile/household", label: "Household", icon: Users, feature: "profileHousehold" },
];

export default function ProfileFinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleTabs = FINANCE_TABS.filter(
    (tab) => !tab.feature || settings.isAdmin || settings.featureFlags[tab.feature]
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.key === "overview"
              ? pathname === "/profile"
              : pathname.startsWith(tab.href);
          return (
            <NextLink
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </NextLink>
          );
        })}
      </div>
      {children}
    </div>
  );
}
