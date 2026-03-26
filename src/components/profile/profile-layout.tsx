"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, UserCircle, Trophy, Plane, LogOut } from "lucide-react";
import { useAppSettings } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";

const TABS: { key: string; href: string; label: string; icon: React.ElementType; feature?: FeatureKey }[] = [
  { key: "finance", href: "/profile", label: "Finance", icon: Wallet },
  { key: "personal", href: "/profile/personal", label: "Personal", icon: UserCircle },
  { key: "challenges", href: "/profile/challenges", label: "Challenges", icon: Trophy, feature: "profileChallenges" },
  { key: "travel", href: "/profile/travel", label: "Travel", icon: Plane, feature: "profileTravel" },
];

export function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const visibleTabs = TABS.filter(
    (tab) => !tab.feature || settings.isAdmin || settings.featureFlags[tab.feature]
  );

  return (
    <div className="space-y-6">
      {/* User info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="text-lg">
              {session?.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight truncate">{session?.user?.name ?? "Profile"}</h2>
            <p className="text-sm text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive hover:text-destructive shrink-0 self-start"
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.key === "finance"
              ? !pathname.startsWith("/profile/personal") && !pathname.startsWith("/profile/challenges") && !pathname.startsWith("/profile/travel")
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
