export const FEATURE_KEYS = [
  "moneyAdvice",
  "billNegotiator",
  "weekendPlanner",
  "mealPlanner",
  "shoppingLists",
  "chat",
  "wealthPilot",
  "receiptScanner",
  "priceAnalysis",
  "transactionMerge",
  "importCsv",
  "importAi",
  "importTelegram",
  "dashPrediction",
  "dashBudgets",
  "dashSavings",
  "dashDebts",
  "dashCategoryChart",
  "dashHeatmap",
  "dashCharts",
  "txAdd",
  "txEdit",
  "txDelete",
  "txSplit",
  "txItems",
  "txConfirm",
  "spendingWrapped",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureFlags = Record<FeatureKey, boolean>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  moneyAdvice: true,
  billNegotiator: true,
  weekendPlanner: true,
  mealPlanner: true,
  shoppingLists: true,
  chat: true,
  wealthPilot: true,
  receiptScanner: true,
  priceAnalysis: true,
  transactionMerge: true,
  importCsv: true,
  importAi: true,
  importTelegram: true,
  dashPrediction: true,
  dashBudgets: true,
  dashSavings: true,
  dashDebts: true,
  dashCategoryChart: true,
  dashHeatmap: true,
  dashCharts: true,
  txAdd: true,
  txEdit: true,
  txDelete: true,
  txSplit: true,
  txItems: true,
  txConfirm: true,
  spendingWrapped: true,
};

export const FEATURE_LABELS: Record<FeatureKey, { label: string; description: string }> = {
  moneyAdvice: { label: "Money Advice", description: "AI-powered financial advice" },
  billNegotiator: { label: "Bill Negotiator", description: "AI bill negotiation suggestions" },
  weekendPlanner: { label: "Weekend Planner", description: "AI weekend activity planner" },
  mealPlanner: { label: "Meal Planner", description: "AI weekly meal planner" },
  shoppingLists: { label: "Shopping Lists", description: "Create and manage shopping lists" },
  chat: { label: "Money Chat", description: "AI chat assistant" },
  wealthPilot: { label: "Wealth Pilot", description: "AI-powered wealth planning and scoring" },
  receiptScanner: { label: "Receipt Scanner", description: "AI receipt item extraction" },
  priceAnalysis: { label: "Price Analysis", description: "Item price tracking and comparison" },
  transactionMerge: { label: "Transaction Merge", description: "Merge duplicate transactions" },
  importCsv: { label: "Import CSV", description: "Import transactions from CSV files" },
  importAi: { label: "Import AI", description: "Import transactions using AI image analysis" },
  importTelegram: { label: "Import Telegram", description: "Import transactions from Telegram chat history" },
  dashPrediction: { label: "Expense Prediction", description: "AI expense prediction card on dashboard" },
  dashBudgets: { label: "Budget Progress", description: "Budget progress card on dashboard" },
  dashSavings: { label: "Savings Goals", description: "Savings goals card on dashboard" },
  dashDebts: { label: "Debts", description: "Debts card on dashboard" },
  dashCategoryChart: { label: "Category Chart", description: "Monthly category breakdown chart on dashboard" },
  dashHeatmap: { label: "Spending Heatmap", description: "Daily spending heatmap on dashboard" },
  dashCharts: { label: "Charts", description: "Monthly bar, donut, merchants, and trend charts on dashboard" },
  txAdd: { label: "Add Transaction", description: "Add new transactions" },
  txEdit: { label: "Edit Transaction", description: "Edit existing transactions" },
  txDelete: { label: "Delete Transaction", description: "Delete transactions" },
  txSplit: { label: "Split Transaction", description: "Split transactions between people/categories" },
  txItems: { label: "Line Items", description: "View and manage transaction line items" },
  txConfirm: { label: "Confirm Transaction", description: "Confirm unconfirmed transactions" },
  spendingWrapped: { label: "Spending Wrapped", description: "Monthly/yearly spending summary with slides" },
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
