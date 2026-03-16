export const FEATURE_KEYS = [
  "lifestyle",
  "chat",
  "wealthPilot",
  "receiptScanner",
  "priceAnalysis",
  "transactionMerge",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureFlags = Record<FeatureKey, boolean>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  lifestyle: true,
  chat: true,
  wealthPilot: true,
  receiptScanner: true,
  priceAnalysis: true,
  transactionMerge: true,
};

export const FEATURE_LABELS: Record<FeatureKey, { label: string; description: string }> = {
  lifestyle: { label: "Lifestyle", description: "Weekend planner, meal planner, shopping lists, money advice, bill negotiator" },
  chat: { label: "Money Chat", description: "AI chat assistant" },
  wealthPilot: { label: "Wealth Pilot", description: "AI-powered wealth planning and scoring" },
  receiptScanner: { label: "Receipt Scanner", description: "AI receipt item extraction" },
  priceAnalysis: { label: "Price Analysis", description: "Item price tracking and comparison" },
  transactionMerge: { label: "Transaction Merge", description: "Merge duplicate transactions" },
};

export function parseFeatureFlags(raw: unknown): FeatureFlags {
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const key of FEATURE_KEYS) {
      if (key in (raw as Record<string, unknown>) && typeof (raw as Record<string, boolean>)[key] === "boolean") {
        flags[key] = (raw as Record<string, boolean>)[key];
      }
    }
  }
  return flags;
}
