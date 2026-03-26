"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  CalendarHeart,
  ChefHat,
  ShoppingCart,
  Scissors,
} from "lucide-react";
import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const TABS: { key: string; label: string; icon: typeof Scissors; route: string; feature: FeatureKey }[] = [
  { key: "negotiate", label: "Negotiate", icon: Scissors, route: "/lifestyle/negotiate", feature: "billNegotiator" },
  { key: "weekend", label: "Weekend", icon: CalendarHeart, route: "/lifestyle/weekend", feature: "weekendPlanner" },
  { key: "meals", label: "Meals", icon: ChefHat, route: "/lifestyle/meals", feature: "mealPlanner" },
  { key: "shopping", label: "Shopping", icon: ShoppingCart, route: "/lifestyle/shopping", feature: "shoppingLists" },
];

export function LifestyleTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleTabs = TABS.filter(
    (tab) => settings.isAdmin || settings.featureFlags[tab.feature]
  );

  if (visibleTabs.length === 0) return null;

  return (
    <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.route ||
          (pathname === "/lifestyle" && tab.key === visibleTabs[0]?.key);
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => router.push(tab.route)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
