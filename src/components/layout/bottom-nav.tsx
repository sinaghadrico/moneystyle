"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  UserCircle,
  MoreHorizontal,
  Settings,
  Palette,
  Sparkles,
  X,
  Brain,
  Calendar,
  UtensilsCrossed,
  ShoppingCart,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const PRIMARY_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

const MORE_NAV = [
  { href: "/lifestyle", label: "Lifestyle", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
];

const QUICK_ACTIONS = [
  { href: "/lifestyle?tab=advice", label: "Money Advice", icon: Brain, color: "text-amber-500", bg: "bg-amber-500/10" },
  { href: "/lifestyle?tab=weekend", label: "Weekend Planner", icon: Calendar, color: "text-rose-500", bg: "bg-rose-500/10" },
  { href: "/lifestyle?tab=meal", label: "Meal Planner", icon: UtensilsCrossed, color: "text-lime-500", bg: "bg-lime-500/10" },
  { href: "/lifestyle?tab=shopping", label: "Shopping Lists", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
];

function FabPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    [onClose, router]
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
        <div className="w-56 rounded-2xl border shadow-2xl shadow-purple-500/10 overflow-hidden backdrop-blur-xl bg-card bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-pink-500/25 dark:from-indigo-500/35 dark:via-purple-500/30 dark:to-pink-500/35">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold">AI & Lifestyle</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-2 pb-2 space-y-0.5">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => handleAction(action.href)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted active:scale-[0.98]"
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
        className="absolute right-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+16px)] md:bottom-6 h-12 w-12 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center"
        style={{
          transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
          transform: animating ? "rotate(90deg) scale(1.1)" : "rotate(0deg) scale(1)",
        }}
      >
        <X className="h-5 w-5 text-white md:h-4 md:w-4" />
      </button>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const isMoreActive = MORE_NAV.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <>
      {/* FAB button */}
      {!fabOpen && (
        <button
          onClick={() => setFabOpen(true)}
          className="fixed z-50 right-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center active:scale-95 transition-transform bottom-[calc(3.5rem+env(safe-area-inset-bottom)+16px)] h-12 w-12 md:bottom-6 md:h-10 md:w-auto md:gap-2 md:px-4"
        >
          <Sparkles className="h-5 w-5 text-white md:h-4 md:w-4" />
          <span className="hidden md:inline text-sm font-medium text-white">AI & Lifestyle</span>
        </button>
      )}

      {/* FAB Popup */}
      <FabPopup open={fabOpen} onClose={() => setFabOpen(false)} />

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 bg-background md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
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
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 py-3",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] leading-tight font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4 pb-6">
            {MORE_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
