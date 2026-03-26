"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Megaphone, Shield, BarChart3, ToggleLeft, FileText } from "lucide-react";
import { useAppSettings } from "@/components/settings/settings-provider";
import { redirect } from "next/navigation";

const ADMIN_TABS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/features", label: "Features", icon: ToggleLeft },
  { href: "/admin/blog", label: "Blog", icon: FileText },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  if (!settings.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-amber-500" />
        <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
