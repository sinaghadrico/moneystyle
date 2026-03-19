"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Settings2,
  ArrowLeftRight,
  Palette,
  Send,
  Database,
  Download,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Brain,
  Plug,
  Wrench,
  MessageSquare,
  Bell,
  ToggleLeft,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  testTelegramConnection,
  exportTransactions,
  generateDeveloperApiKey,
  revokeApiKey,
} from "@/actions/settings";
import { getAccountsList } from "@/actions/transactions";
import { useAppSettings } from "@/components/settings/settings-provider";
import { SmsPatternsSection } from "@/components/settings/sms-patterns-section";
import { CurrencyManagementSection } from "@/components/settings/currency-management-section";
import { AiPromptsSection } from "@/components/settings/ai-prompts-section";
import { NotificationTemplatesSection } from "@/components/settings/notification-templates-section";
import { CurrencySelect } from "@/components/ui/currency-select";
import { FeatureFlagsSection } from "@/components/settings/feature-flags-section";
import {
  type FeatureFlags,
  DEFAULT_FEATURE_FLAGS,
  parseFeatureFlags,
} from "@/lib/feature-flags";

type Settings = {
  currency: string;
  defaultPageSize: number;
  defaultAccountId: string | null;
  defaultTransactionType: "income" | "expense" | "transfer" | "other";
  defaultDashboardPeriod: "all" | "3m" | "6m" | "1y";
  autoCategorize: boolean;
  telegramEnabled: boolean;
  telegramBotToken: string | null;
  telegramWebhookSecret: string | null;
  telegramChatId: string | null;
  smsApiKey: string | null;
  aiEnabled: boolean;
  openaiApiKey: string | null;
  notifyPaymentReminders: boolean;
  notifyWeekendPlan: boolean;
  notifyMonthlyReport: boolean;
  notifyWebTransaction: boolean;
  notifySmsTransaction: boolean;
  featureFlags: FeatureFlags;
};

type Account = { id: string; name: string };

const SETTINGS_TABS = [
  { key: "general", label: "General", icon: Settings2 },
  { key: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "features", label: "Features", icon: ToggleLeft, adminOnly: true },
  { key: "advanced", label: "Advanced", icon: Wrench },
];

type SettingsTab = string;

const INTEGRATION_SECTIONS = [
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "ai", label: "AI", icon: Brain },
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "api", label: "API", icon: Database },
] as const;

type IntegrationSection = (typeof INTEGRATION_SECTIONS)[number]["key"];

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [integrationSection, setIntegrationSection] =
    useState<IntegrationSection>("telegram");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const { theme, setTheme } = useTheme();
  const { refresh: refreshAppSettings, settings: appSettings } =
    useAppSettings();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [s, a] = await Promise.all([getSettings(), getAccountsList()]);
    setSettings({
      currency: s.currency,
      defaultPageSize: s.defaultPageSize,
      defaultAccountId: s.defaultAccountId,
      defaultTransactionType:
        s.defaultTransactionType as Settings["defaultTransactionType"],
      defaultDashboardPeriod:
        s.defaultDashboardPeriod as Settings["defaultDashboardPeriod"],
      autoCategorize: s.autoCategorize,
      telegramEnabled: s.telegramEnabled,
      telegramBotToken: s.telegramBotToken,
      telegramWebhookSecret: s.telegramWebhookSecret,
      telegramChatId: s.telegramChatId,
      smsApiKey: s.smsApiKey,
      aiEnabled: s.aiEnabled,
      openaiApiKey: s.openaiApiKey,
      notifyPaymentReminders: s.notifyPaymentReminders,
      notifyWeekendPlan: s.notifyWeekendPlan,
      notifyMonthlyReport: s.notifyMonthlyReport,
      notifyWebTransaction: s.notifyWebTransaction,
      notifySmsTransaction: s.notifySmsTransaction,
      featureFlags: parseFeatureFlags(s.featureFlags),
    });
    setIsAdmin(s.userRole === "admin");
    setAccounts(a.map((acc) => ({ id: acc.id, name: acc.name })));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const result = await updateSettings(settings);
    setSaving(false);
    if ("error" in result) {
      toast.error(`❌ ${result.error}`);
    } else {
      toast.success("✅ Settings saved");
      await refreshAppSettings();
    }
  };

  const handleTestTelegram = async () => {
    if (!settings?.telegramBotToken || !settings?.telegramChatId) {
      toast.error("❌ Bot token and chat ID are required");
      return;
    }
    setTestingTelegram(true);
    const result = await testTelegramConnection(
      settings.telegramBotToken,
      settings.telegramChatId,
    );
    setTestingTelegram(false);
    if ("error" in result) {
      toast.error(`❌ ${result.error}`);
    } else {
      toast.success("📨 Test message sent! Check your Telegram.");
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    if (format === "csv") setExportingCsv(true);
    else setExportingJson(true);

    const data = await exportTransactions(format);
    const blob = new Blob([data], {
      type: format === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    if (format === "csv") setExportingCsv(false);
    else setExportingJson(false);
    toast.success(`📤 Exported as ${format.toUpperCase()}`);
  };

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">⚙️ Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">⚙️ Settings</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {SETTINGS_TABS.filter((tab) => !tab.adminOnly || isAdmin).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General tab */}
      {activeTab === "general" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* General */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Primary Currency</Label>
                <CurrencySelect
                  id="currency"
                  value={settings.currency}
                  onValueChange={(v) => update({ currency: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageSize">Default Page Size</Label>
                <Input
                  id="pageSize"
                  type="number"
                  min={5}
                  max={100}
                  value={settings.defaultPageSize}
                  onChange={(e) =>
                    update({ defaultPageSize: parseInt(e.target.value) || 20 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboardPeriod">Dashboard Period</Label>
                <Select
                  value={settings.defaultDashboardPeriod}
                  onValueChange={(v) =>
                    update({
                      defaultDashboardPeriod:
                        v as Settings["defaultDashboardPeriod"],
                    })
                  }
                >
                  <SelectTrigger id="dashboardPeriod" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex-1"
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions tab */}
      {activeTab === "transactions" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowLeftRight className="h-4 w-4" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="txType">Default Transaction Type</Label>
                <Select
                  value={settings.defaultTransactionType}
                  onValueChange={(v) =>
                    update({
                      defaultTransactionType:
                        v as Settings["defaultTransactionType"],
                    })
                  }
                >
                  <SelectTrigger id="txType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultAccount">Default Account</Label>
                <Select
                  value={settings.defaultAccountId ?? "none"}
                  onValueChange={(v) =>
                    update({ defaultAccountId: v === "none" ? null : v })
                  }
                >
                  <SelectTrigger id="defaultAccount" className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoCategorize">
                  Auto-categorize by merchant rules
                </Label>
                <Switch
                  id="autoCategorize"
                  checked={settings.autoCategorize}
                  onCheckedChange={(v) => update({ autoCategorize: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency Management */}
          <CurrencyManagementSection />
        </div>
      )}

      {/* Integrations tab */}
      {activeTab === "integrations" && (
        <div className="space-y-5">
          {/* Integration sub-navigation */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {INTEGRATION_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = integrationSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setIntegrationSection(section.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Telegram */}
          {integrationSection === "telegram" && (
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
                        update({
                          telegramWebhookSecret: e.target.value || null,
                        })
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

              {/* Notification Toggles */}
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
                      onCheckedChange={(v) =>
                        update({ notifyPaymentReminders: v })
                      }
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
                      onCheckedChange={(v) =>
                        update({ notifyMonthlyReport: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyWebTransaction" className="text-sm">
                      Web Transaction Alerts
                    </Label>
                    <Switch
                      id="notifyWebTransaction"
                      checked={settings.notifyWebTransaction}
                      onCheckedChange={(v) =>
                        update({ notifyWebTransaction: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifySmsTransaction" className="text-sm">
                      SMS Transaction Alerts
                    </Label>
                    <Switch
                      id="notifySmsTransaction"
                      checked={settings.notifySmsTransaction}
                      onCheckedChange={(v) =>
                        update({ notifySmsTransaction: v })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <NotificationTemplatesSection />
            </div>
          )}

          {/* AI */}
          {integrationSection === "ai" && (
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
                      Used for receipt parsing, meal planning, weekend planning,
                      money advice, and more. If left blank, falls back to the{" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                        OPENAI_API_KEY
                      </code>{" "}
                      env var.
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
                        <li>
                          Copy the key (starts with{" "}
                          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                            sk-
                          </code>
                          ) and paste above
                        </li>
                      </ol>
                      <p className="mt-1">
                        You need a paid account with credits. Receipt parsing
                        costs ~$0.01 per image.
                      </p>
                    </details>
                  </div>
                </CardContent>
              </Card>

              <AiPromptsSection />
            </div>
          )}

          {/* SMS */}
          {integrationSection === "sms" && <SmsPatternsSection />}

          {/* API */}
          {integrationSection === "api" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="h-4 w-4" />
                  Developer API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Use the API to programmatically access your transactions, categories, and accounts.
                  See <a href="/docs/api" className="underline underline-offset-2 hover:text-foreground">API Documentation</a>.
                </p>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      type="password"
                      value={appSettings?.developerApiKey ?? ""}
                      placeholder="No API key generated"
                      className="font-mono text-xs"
                    />
                    {appSettings?.developerApiKey ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-destructive"
                        onClick={async () => {
                          await revokeApiKey();
                          toast.success("API key revoked");
                          await refreshAppSettings();
                        }}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={async () => {
                          const result = await generateDeveloperApiKey();
                          if (result.success) {
                            await navigator.clipboard.writeText(result.apiKey);
                            toast.success("API key generated and copied to clipboard");
                            await refreshAppSettings();
                          }
                        }}
                      >
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/70">Base URL</p>
                  <code className="block rounded bg-muted px-2 py-1 font-mono text-[11px]">
                    {typeof window !== "undefined" ? window.location.origin : ""}/api/v1
                  </code>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Features tab */}
      {activeTab === "features" && (
        <FeatureFlagsSection
          flags={settings.featureFlags}
          onChange={(flags) => update({ featureFlags: flags })}
        />
      )}

      {/* Advanced tab */}
      {activeTab === "advanced" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={exportingCsv}
              >
                {exportingCsv ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={exportingJson}
              >
                {exportingJson ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export JSON
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Export all transactions with categories, accounts, and tags
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
