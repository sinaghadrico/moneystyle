"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  UserCircle,
  MoreHorizontal,
  Landmark,
  Users,
  Tags,
  Merge,
  Settings,
  ChefHat,
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
  { href: "/price-analysis", label: "Prices", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

const MORE_NAV = [
  { href: "/meal-planner", label: "Meal Planner", icon: ChefHat },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/persons", label: "Persons", icon: Users },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/merge-suggestions", label: "Merge Duplicates", icon: Merge },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_NAV.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-card md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
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
                  "flex flex-col items-center gap-0.5 py-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] leading-tight">More</span>
          </button>
        </div>
      </nav>

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
