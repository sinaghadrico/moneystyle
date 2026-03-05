"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Landmark, Users, Tags } from "lucide-react";

const MANAGE_TABS = [
  { key: "accounts", href: "/transactions/manage", label: "Accounts", icon: Landmark },
  { key: "persons", href: "/transactions/manage/persons", label: "Persons", icon: Users },
  { key: "categories", href: "/transactions/manage/categories", label: "Categories", icon: Tags },
] as const;

export default function TransactionsManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {MANAGE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.key === "accounts"
              ? pathname === "/transactions/manage"
              : pathname.startsWith(tab.href);
          return (
            <NextLink
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </NextLink>
          );
        })}
      </div>
      {children}
    </div>
  );
}
