export const TRANSACTION_TYPES = ["income", "expense", "transfer", "other"] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const CURRENCY = "AED";

export const DEFAULT_ACCOUNT_ID = "default_farnoosh_mashreq";

export const PERIOD_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
] as const;
