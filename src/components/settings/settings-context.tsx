"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getSettings,
  updateSettings,
  testTelegramConnection,
  exportTransactions,
} from "@/actions/settings";
import { getAccountsList } from "@/actions/transactions";
import { useAppSettings } from "@/components/settings/settings-provider";
import { type FeatureFlags, DEFAULT_FEATURE_FLAGS, parseFeatureFlags } from "@/lib/feature-flags";

export type Settings = {
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

type AccountOption = { id: string; name: string };

type SettingsContextValue = {
  settings: Settings | null;
  accounts: AccountOption[];
  loading: boolean;
  saving: boolean;
  update: (patch: Partial<Settings>) => void;
  handleSave: () => Promise<void>;
  handleTestTelegram: () => Promise<void>;
  testingTelegram: boolean;
  handleExport: (format: "csv" | "json") => Promise<void>;
  exportingCsv: boolean;
  exportingJson: boolean;
  isAdmin: boolean;
};

const SettingsCtx = createContext<SettingsContextValue>(null!);

export function useSettingsContext() {
  return useContext(SettingsCtx);
}

export function SettingsContextProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
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

  useEffect(() => { loadData(); }, [loadData]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

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
    const result = await testTelegramConnection(settings.telegramBotToken, settings.telegramChatId);
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
    const blob = new Blob([data], { type: format === "csv" ? "text/csv" : "application/json" });
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

  return (
    <SettingsCtx.Provider
      value={{
        settings, accounts, loading, saving,
        update, handleSave,
        handleTestTelegram, testingTelegram,
        handleExport, exportingCsv, exportingJson,
        isAdmin,
      }}
    >
      {children}
    </SettingsCtx.Provider>
  );
}
