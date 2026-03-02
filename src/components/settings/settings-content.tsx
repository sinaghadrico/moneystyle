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
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  testTelegramConnection,
  exportTransactions,
} from "@/actions/settings";
import { getAccountsList } from "@/actions/transactions";
import { useAppSettings } from "@/components/settings/settings-provider";
import { SmsPatternsSection } from "@/components/settings/sms-patterns-section";

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
};

type Account = { id: string; name: string };

export function SettingsContent() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const { theme, setTheme } = useTheme();
  const { refresh: refreshAppSettings } = useAppSettings();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [s, a] = await Promise.all([getSettings(), getAccountsList()]);
    setSettings({
      currency: s.currency,
      defaultPageSize: s.defaultPageSize,
      defaultAccountId: s.defaultAccountId,
      defaultTransactionType: s.defaultTransactionType as Settings["defaultTransactionType"],
      defaultDashboardPeriod: s.defaultDashboardPeriod as Settings["defaultDashboardPeriod"],
      autoCategorize: s.autoCategorize,
      telegramEnabled: s.telegramEnabled,
      telegramBotToken: s.telegramBotToken,
      telegramWebhookSecret: s.telegramWebhookSecret,
      telegramChatId: s.telegramChatId,
      smsApiKey: s.smsApiKey,
    });
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
      toast.error(result.error);
    } else {
      toast.success("Settings saved");
      await refreshAppSettings();
    }
  };

  const handleTestTelegram = async () => {
    if (!settings?.telegramBotToken || !settings?.telegramChatId) {
      toast.error("Bot token and chat ID are required");
      return;
    }
    setTestingTelegram(true);
    const result = await testTelegramConnection(
      settings.telegramBotToken,
      settings.telegramChatId,
    );
    setTestingTelegram(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Test message sent! Check your Telegram.");
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
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
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
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

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
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => update({ currency: e.target.value })}
                maxLength={5}
                placeholder="AED"
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
            <div className="space-y-2">
              <Label htmlFor="dashboardPeriod">Dashboard Period</Label>
              <Select
                value={settings.defaultDashboardPeriod}
                onValueChange={(v) => update({ defaultDashboardPeriod: v as Settings["defaultDashboardPeriod"] })}
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
                onValueChange={(v) => update({ defaultTransactionType: v as Settings["defaultTransactionType"] })}
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

        {/* Telegram */}
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

        {/* SMS Patterns */}
        <SmsPatternsSection />

        {/* Data Management */}
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
      </div>
    </div>
  );
}
