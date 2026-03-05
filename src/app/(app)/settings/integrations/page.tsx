"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, Brain, MessageSquare, Bell, Loader2 } from "lucide-react";
import { useSettingsContext } from "@/components/settings/settings-context";
import { SmsPatternsSection } from "@/components/settings/sms-patterns-section";
import { AiPromptsSection } from "@/components/settings/ai-prompts-section";
import { NotificationTemplatesSection } from "@/components/settings/notification-templates-section";

const INTEGRATION_SECTIONS = [
  { key: "ai", label: "AI", icon: Brain },
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "sms", label: "SMS", icon: MessageSquare },
] as const;

type IntegrationSection = (typeof INTEGRATION_SECTIONS)[number]["key"];

export default function SettingsIntegrationsPage() {
  const [section, setSection] = useState<IntegrationSection>("ai");
  const { settings, update, handleTestTelegram, testingTelegram } = useSettingsContext();

  if (!settings) return null;

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {INTEGRATION_SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = section === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSection(s.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "telegram" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                Telegram
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="telegramEnabled">Enable Telegram</Label>
                <Switch
                  id="telegramEnabled"
                  checked={settings.telegramEnabled}
                  onCheckedChange={(v) => update({ telegramEnabled: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="botToken">Bot Token</Label>
                <Input
                  id="botToken"
                  type="password"
                  value={settings.telegramBotToken ?? ""}
                  onChange={(e) =>
                    update({ telegramBotToken: e.target.value || null })
                  }
                  placeholder="123456:ABC-DEF..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  value={settings.telegramWebhookSecret ?? ""}
                  onChange={(e) =>
                    update({ telegramWebhookSecret: e.target.value || null })
                  }
                  placeholder="Optional secret"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chatId">Chat ID</Label>
                <Input
                  id="chatId"
                  value={settings.telegramChatId ?? ""}
                  onChange={(e) =>
                    update({ telegramChatId: e.target.value || null })
                  }
                  placeholder="-1001234567890"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestTelegram}
                disabled={
                  testingTelegram ||
                  !settings.telegramBotToken ||
                  !settings.telegramChatId
                }
              >
                {testingTelegram && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Test Connection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Choose which notifications are sent via Telegram.
              </p>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyPaymentReminders" className="text-sm">
                  Payment Reminders
                </Label>
                <Switch
                  id="notifyPaymentReminders"
                  checked={settings.notifyPaymentReminders}
                  onCheckedChange={(v) => update({ notifyPaymentReminders: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyWeekendPlan" className="text-sm">
                  Weekend Plan Reminder
                </Label>
                <Switch
                  id="notifyWeekendPlan"
                  checked={settings.notifyWeekendPlan}
                  onCheckedChange={(v) => update({ notifyWeekendPlan: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyMonthlyReport" className="text-sm">
                  Monthly Report
                </Label>
                <Switch
                  id="notifyMonthlyReport"
                  checked={settings.notifyMonthlyReport}
                  onCheckedChange={(v) => update({ notifyMonthlyReport: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyWebTransaction" className="text-sm">
                  Web Transaction Alerts
                </Label>
                <Switch
                  id="notifyWebTransaction"
                  checked={settings.notifyWebTransaction}
                  onCheckedChange={(v) => update({ notifyWebTransaction: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifySmsTransaction" className="text-sm">
                  SMS Transaction Alerts
                </Label>
                <Switch
                  id="notifySmsTransaction"
                  checked={settings.notifySmsTransaction}
                  onCheckedChange={(v) => update({ notifySmsTransaction: v })}
                />
              </div>
            </CardContent>
          </Card>

          <NotificationTemplatesSection />
        </div>
      )}

      {section === "ai" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4" />
                OpenAI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="aiEnabled">Enable AI</Label>
                <Switch
                  id="aiEnabled"
                  checked={settings.aiEnabled}
                  onCheckedChange={(v) => update({ aiEnabled: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={settings.openaiApiKey ?? ""}
                  onChange={(e) =>
                    update({ openaiApiKey: e.target.value || null })
                  }
                  placeholder="sk-..."
                />
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Used for receipt parsing, meal planning, weekend planning, money advice, and more.
                  If left blank, falls back to the <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">OPENAI_API_KEY</code> env var.
                </p>
                <details className="cursor-pointer">
                  <summary className="font-medium text-foreground/70 hover:text-foreground">
                    How to get an API key
                  </summary>
                  <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
                    <li>
                      Go to{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        platform.openai.com/api-keys
                      </a>
                    </li>
                    <li>Sign in or create an account</li>
                    <li>Click &quot;Create new secret key&quot;</li>
                    <li>Copy the key (starts with <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">sk-</code>) and paste above</li>
                  </ol>
                  <p className="mt-1">
                    You need a paid account with credits. Receipt parsing costs ~$0.01 per image.
                  </p>
                </details>
              </div>
            </CardContent>
          </Card>

          <AiPromptsSection />
        </div>
      )}

      {section === "sms" && <SmsPatternsSection />}
    </div>
  );
}
