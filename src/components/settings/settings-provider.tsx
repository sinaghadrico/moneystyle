"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSettings } from "@/actions/settings";
import { setCurrencyOverride } from "@/lib/utils";
import { type FeatureFlags, type FeatureKey, DEFAULT_FEATURE_FLAGS, parseFeatureFlags } from "@/lib/feature-flags";

type AppSettings = {
  currency: string;
  defaultPageSize: number;
  defaultAccountId: string | null;
  defaultTransactionType: string;
  defaultDashboardPeriod: string;
  autoCategorize: boolean;
  aiEnabled: boolean;
  hasOpenaiKey: boolean;
  featureFlags: FeatureFlags;
  isAdmin: boolean;
};

const DEFAULTS: AppSettings = {
  currency: "AED",
  defaultPageSize: 20,
  defaultAccountId: null,
  defaultTransactionType: "expense",
  defaultDashboardPeriod: "3m",
  autoCategorize: true,
  aiEnabled: false,
  hasOpenaiKey: false,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  isAdmin: false,
};

const SettingsContext = createContext<{
  settings: AppSettings;
  ready: boolean;
  refresh: () => Promise<void>;
}>({ settings: DEFAULTS, ready: false, refresh: async () => {} });

export function useAppSettings() {
  return useContext(SettingsContext);
}

export function useFeatureFlag(key: FeatureKey): boolean {
  const { settings } = useAppSettings();
  if (settings.isAdmin) return true;
  return settings.featureFlags[key];
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const s = await getSettings();
    setCurrencyOverride(s.currency);
    setSettings({
      currency: s.currency,
      defaultPageSize: s.defaultPageSize,
      defaultAccountId: s.defaultAccountId,
      defaultTransactionType: s.defaultTransactionType,
      defaultDashboardPeriod: s.defaultDashboardPeriod,
      autoCategorize: s.autoCategorize,
      aiEnabled: s.aiEnabled,
      hasOpenaiKey: !!s.openaiApiKey,
      featureFlags: parseFeatureFlags(s.featureFlags),
      isAdmin: s.userRole === "admin",
    });
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, ready, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}
