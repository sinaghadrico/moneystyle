"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sparkles, CalendarHeart, ChefHat, ShoppingCart } from "lucide-react";

const TABS = [
  { key: "advice", label: "Advice", icon: Sparkles, route: "/lifestyle/advice" },
  { key: "weekend", label: "Weekend", icon: CalendarHeart, route: "/lifestyle/weekend" },
  { key: "meals", label: "Meals", icon: ChefHat, route: "/lifestyle/meals" },
  { key: "shopping", label: "Shopping", icon: ShoppingCart, route: "/lifestyle/shopping" },
] as const;

export function LifestyleTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.route || (pathname === "/lifestyle" && tab.key === "advice");
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
