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
  MapPin,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { WrappedButton } from "./wrapped-button";
import { UserMenu } from "@/components/auth/user-menu";
import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const LIFESTYLE_FEATURES: FeatureKey[] = ["moneyPilot", "billNegotiator", "weekendPlanner", "mealPlanner", "shoppingLists"];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

import { Sparkles } from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { href: "/lifestyle", label: "Money Lifestyle", desc: "Plan your life", icon: Palette, feature: "_lifestyle" as FeatureKey, gradient: "from-rose-500 to-pink-600", color: "text-rose-500", bg: "bg-rose-500/10" },
  { href: "/pilot", label: "Money Pilot", desc: "AI wealth plan", icon: Rocket, feature: "moneyPilot" as FeatureKey, gradient: "from-violet-500 to-purple-600", color: "text-violet-500", bg: "bg-violet-500/10" },
  { href: "/chat", label: "Money Chat", desc: "Ask anything", icon: MessageCircle, feature: "chat" as FeatureKey, gradient: "from-emerald-500 to-teal-600", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { href: "/money-map", label: "Money Map", desc: "Spending map", icon: MapPin, feature: "moneyMap" as FeatureKey, gradient: "from-teal-500 to-cyan-600", color: "text-teal-500", bg: "bg-teal-500/10" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if ("adminOnly" in item && item.adminOnly) return settings.isAdmin;
    return true;
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

function BottomNavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleItems = BOTTOM_NAV_ITEMS.filter((item) => {
    if (settings.isAdmin) return true;
    if (item.feature === ("_lifestyle" as FeatureKey)) {
      return LIFESTYLE_FEATURES.some((f) => settings.featureFlags[f]);
    }
    return settings.featureFlags[item.feature];
  });

  if (visibleItems.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-neutral-500/5 via-transparent to-neutral-500/5 dark:from-neutral-400/10 dark:to-neutral-400/10 p-1.5 space-y-0.5">
      <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-1">
        <Sparkles className="h-3 w-3 text-amber-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">AI Tools</p>
      </div>
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-all duration-200",
              isActive
                ? "bg-background shadow-sm shadow-black/5"
                : "hover:bg-background/50",
            )}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
              isActive
                ? `bg-gradient-to-br ${item.gradient} shadow-sm`
                : `${item.bg} group-hover:scale-105`,
            )}>
              <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : item.color)} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-xs font-semibold leading-tight truncate", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{item.label}</p>
              <p className="text-[10px] leading-tight text-muted-foreground/60 truncate">{item.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
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
      <div className="mt-auto space-y-3">
        <BottomNavLinks />
        <div className="pt-3 border-t flex items-center justify-between">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
