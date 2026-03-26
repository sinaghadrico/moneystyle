"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  UserCircle,
  Settings,
  Sparkles,
  X,
  Calendar,
  UtensilsCrossed,
  ShoppingCart,
  MessageCircle,
  Rocket,
  MapPin,
  Plane,
  Shield,
} from "lucide-react";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const QUICK_ACTIONS = [
  { href: "/chat", label: "Money Chat", icon: MessageCircle, color: "text-violet-500", bg: "bg-violet-500/10", feature: "chat" as FeatureKey },
  { href: "/pilot", label: "Money Pilot", icon: Rocket, color: "text-emerald-500", bg: "bg-emerald-500/10", feature: "moneyPilot" as FeatureKey },
  { href: "/lifestyle/weekend", label: "Weekend Planner", icon: Calendar, color: "text-rose-500", bg: "bg-rose-500/10", feature: "weekendPlanner" as FeatureKey },
  { href: "/lifestyle/meals", label: "Meal Planner", icon: UtensilsCrossed, color: "text-lime-500", bg: "bg-lime-500/10", feature: "mealPlanner" as FeatureKey },
  { href: "/lifestyle/shopping", label: "Shopping Lists", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10", feature: "shoppingLists" as FeatureKey },
  { href: "/money-map", label: "Money Map", icon: MapPin, color: "text-teal-500", bg: "bg-teal-500/10" },
  { href: "/travel", label: "Travel", icon: Plane, color: "text-sky-500", bg: "bg-sky-500/10" },
];

function FabPopup({ open, onClose, actions }: { open: boolean; onClose: () => void; actions: typeof QUICK_ACTIONS }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // Double rAF ensures browser has painted the initial state before triggering transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
    } else {
      setAnimating(false);
      const t = setTimeout(() => setVisible(false), 450);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleAction = useCallback(
    (href: string) => {
      onClose();
      setTimeout(() => router.push(href), 200);
    },
    [onClose]
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-[400ms]",
          animating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Panel — sits above the FAB */}
      <div
        className="absolute right-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+16px+3.5rem)] md:bottom-[calc(1.5rem+3.5rem)] origin-bottom-right"
        style={{
          transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease",
          transform: animating ? "scale(1)" : "scale(0.3)",
          opacity: animating ? 1 : 0,
        }}
      >
        <div className="w-56 rounded-lg border shadow-2xl shadow-black/10 overflow-hidden backdrop-blur-xl bg-card bg-gradient-to-br from-neutral-500/10 via-neutral-400/5 to-neutral-500/10 dark:from-neutral-400/15 dark:via-neutral-500/10 dark:to-neutral-400/15">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-semibold">AI & Lifestyle</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-2 pb-2 space-y-0.5">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => handleAction(action.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted active:scale-[0.98]"
                  style={{
                    transition: "opacity 300ms ease, transform 300ms ease",
                    transitionDelay: animating ? `${(i + 1) * 60}ms` : "0ms",
                    opacity: animating ? 1 : 0,
                    transform: animating ? "translateY(0)" : "translateY(8px)",
                  }}
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", action.bg)}>
                    <Icon className={cn("h-4 w-4", action.color)} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Close FAB */}
      <button
        onClick={onClose}
        className="absolute right-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+16px)] md:bottom-6 h-12 w-12 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-900 shadow-lg shadow-black/40 flex items-center justify-center"
        style={{
          transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
          transform: animating ? "rotate(90deg) scale(1.1)" : "rotate(0deg) scale(1)",
        }}
      >
        <X className="h-5 w-5 text-amber-400 md:h-4 md:w-4" />
      </button>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);
  const { settings } = useAppSettings();

  const isOnboarding = pathname.startsWith("/onboarding");

  const visibleActions = QUICK_ACTIONS.filter(
    (action) => !action.feature || settings.isAdmin || settings.featureFlags[action.feature]
  );

  if (isOnboarding) return null;

  return (
    <>
      {/* FAB button */}
      {!fabOpen && visibleActions.length > 0 && (
        <button
          onClick={() => setFabOpen(true)}
          className="fixed z-50 right-4 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-900 shadow-lg shadow-black/40 flex items-center justify-center gap-2 px-4 active:scale-95 transition-transform bottom-[calc(3.5rem+env(safe-area-inset-bottom)+16px)] h-12 w-auto md:bottom-6 md:h-10 animate-fab-pulse overflow-hidden fab-shimmer"
        >
          <Sparkles className="h-5 w-5 text-amber-400 md:h-4 md:w-4 animate-[spin_4s_linear_infinite]" />
          <span className="text-sm font-medium text-white">AI & Lifestyle</span>
        </button>
      )}

      {/* FAB Popup */}
      <FabPopup open={fabOpen} onClose={() => setFabOpen(false)} actions={visibleActions} />

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 bg-background md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className={`grid ${settings.isAdmin ? "grid-cols-5" : "grid-cols-4"}`}>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-tight font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center gap-1 py-3",
              pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] leading-tight font-medium">Settings</span>
          </Link>
          {settings.isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex flex-col items-center gap-1 py-3",
                pathname.startsWith("/admin") ? "text-amber-500" : "text-muted-foreground"
              )}
            >
              <Shield className="h-5 w-5" />
              <span className="text-[10px] leading-tight font-medium">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
