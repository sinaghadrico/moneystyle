"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSettings } from "@/actions/settings";
import { setCurrencyOverride } from "@/lib/utils";

type AppSettings = {
  currency: string;
  defaultPageSize: number;
  defaultAccountId: string | null;
  defaultTransactionType: string;
  defaultDashboardPeriod: string;
  autoCategorize: boolean;
};

const DEFAULTS: AppSettings = {
  currency: "AED",
  defaultPageSize: 20,
  defaultAccountId: null,
  defaultTransactionType: "expense",
  defaultDashboardPeriod: "3m",
  autoCategorize: true,
};

const SettingsContext = createContext<{
  settings: AppSettings;
  refresh: () => Promise<void>;
}>({ settings: DEFAULTS, refresh: async () => {} });

export function useAppSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

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
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}
