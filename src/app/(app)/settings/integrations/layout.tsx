"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Brain, Send, MessageSquare } from "lucide-react";

const INTEGRATION_TABS = [
  { key: "ai", href: "/settings/integrations", label: "AI", icon: Brain },
  { key: "telegram", href: "/settings/integrations/telegram", label: "Telegram", icon: Send },
  { key: "sms", href: "/settings/integrations/sms", label: "SMS", icon: MessageSquare },
] as const;

export default function SettingsIntegrationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {INTEGRATION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.key === "ai"
              ? pathname === "/settings/integrations"
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
