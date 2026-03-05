"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Settings2, ArrowLeftRight, Plug, Wrench } from "lucide-react";
import { SettingsContextProvider, useSettingsContext } from "@/components/settings/settings-context";

const SETTINGS_TABS = [
  { href: "/settings", label: "General", icon: Settings2 },
  { href: "/settings/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/advanced", label: "Advanced", icon: Wrench },
] as const;

function SettingsLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, saving, handleSave } = useSettingsContext();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/settings"
              ? pathname === "/settings"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsContextProvider>
      <SettingsLayoutInner>{children}</SettingsLayoutInner>
    </SettingsContextProvider>
  );
}
