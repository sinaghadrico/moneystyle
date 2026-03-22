"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  UserCircle,
  Palette,
  MessageCircle,
  Rocket,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { WrappedButton } from "./wrapped-button";
import { UserMenu } from "@/components/auth/user-menu";
import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const LIFESTYLE_FEATURES: FeatureKey[] = ["moneyAdvice", "billNegotiator", "weekendPlanner", "mealPlanner", "shoppingLists"];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/wealth", label: "Wealth Pilot", icon: Rocket, feature: "wealthPilot" as FeatureKey },
  { href: "/chat", label: "Money Chat", icon: MessageCircle, feature: "chat" as FeatureKey },
  { href: "/lifestyle", label: "Lifestyle", icon: Palette, feature: "_lifestyle" as FeatureKey },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if ("adminOnly" in item && item.adminOnly) return settings.isAdmin;
    if (!item.feature) return true;
    if (settings.isAdmin) return true;
    if (item.feature === ("_lifestyle" as FeatureKey)) {
      return LIFESTYLE_FEATURES.some((f) => settings.featureFlags[f]);
    }
    return settings.featureFlags[item.feature];
  });

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:py-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen w-56 flex-col border-r bg-card px-3 py-4">
      <div className="mb-6 px-3 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-lg font-bold tracking-tight">MoneyStyle</h1>
          <p className="text-xs text-muted-foreground">💰 Finance Tracker</p>
        </Link>
        <WrappedButton />
      </div>
      <NavLinks />
      <div className="mt-auto pt-4 border-t flex items-center justify-between">
        <ThemeToggle />
        <UserMenu />
      </div>
    </aside>
  );
}
