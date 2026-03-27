import type { Account, Category, Transaction, Tag } from "@prisma/client";

export type TagData = {
  id: string;
  name: string;
  color: string;
};

export type TransactionSplitData = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  personId: string | null;
  personName: string | null;
  personColor: string | null;
  amount: number;
  description: string | null;
};

export type TransactionPaymentLink = {
  type: "installment" | "bill" | "income";
  paymentId: string;
  parentId: string;
  parentName: string;
};

export type TransactionWithCategory = Omit<Transaction, "amount"> & {
  amount: number | null;
  category: Category | null;
  account: Account;
  tags: TagData[];
  splits?: TransactionSplitData[];
  lineItemCount?: number;
  paymentLink?: TransactionPaymentLink | null;
};

export type AccountWithStats = {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  color: string;
  icon: string | null;
  transactionCount: number;
  totalAmount: number;
};

export type DashboardStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
};

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

export type CategoryBreakdown = {
  name: string;
  color: string;
  total: number;
  count: number;
};

export type MerchantTotal = {
  merchant: string;
  total: number;
  count: number;
};

export type TransactionFilters = {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  type?: string;
  merchant?: string;
  tagIds?: string[];
  amountMin?: number;
  amountMax?: number;
  search?: string;
  source?: string;
  confirmed?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ExpensePrediction = {
  spent: number;
  predicted: number;
  daysElapsed: number;
  daysInMonth: number;
  dailyAverage: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MonthlyCategoryData = {
  month: string;
  [category: string]: number | string; // month is string, rest are numbers
};

export type CategoryMeta = {
  name: string;
  color: string;
};

export type PeriodFilter = "all" | "3m" | "6m" | "1y";

export type DebtSummary = {
  personId: string;
  personName: string;
  personColor: string;
  totalSplits: number;
  totalSettled: number;
  balance: number;
};

export type DailySpend = { date: string; amount: number };

export type WrappedData = {
  month: string;
  monthLabel: string;
  totalSpent: number;
  totalIncome: number;
  netBalance: number;
  transactionCount: number;
  vsLastMonthPercent: number | null;
  topCategory: {
    name: string;
    color: string;
    amount: number;
    percentOfTotal: number;
    count: number;
  } | null;
  biggestExpense: {
    merchant: string;
    amount: number;
    date: string;
    category: string;
  } | null;
  favoriteMerchant: {
    merchant: string;
    visitCount: number;
    totalSpent: number;
  } | null;
  spendingPattern: {
    busiestDay: string;
    lightestDay: string;
    dailyAmounts: number[];
  };
  funFacts: {
    noSpendDays: number;
    totalDaysInMonth: number;
    avgDailySpend: number;
    longestNoSpendStreak: number;
  };
  categoryBreakdown: { name: string; color: string; amount: number }[];
};

export type TransactionItemData = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
};

export type SavingsProgress = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: Date | null;
  color: string;
  status: string;
  percentage: number;
};

// Price Analysis types

export type PriceAnalysisFilters = {
  search?: string;
  fuzzy?: boolean;
  sortBy?: "name" | "avgPrice" | "totalPurchases" | "lastDate";
  sortOrder?: "asc" | "desc";
};

export type ItemPriceSummary = {
  normalizedName: string;
  displayName: string;
  isGroup: boolean;
  groupId?: string;
  rawNames: string[];
  merchantNames: string[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalPurchases: number;
  cheapestMerchant: string | null;
  lastDate: string;
  priceChangePercent: number | null;
};

export type ItemMerchantStats = {
  merchant: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
  lastDate: string;
};

export type ItemPricePoint = {
  date: string;
  price: number;
  merchant: string;
  transactionId: string;
  description: string;
};

export type ItemDetail = {
  normalizedName: string;
  displayName: string;
  merchantStats: ItemMerchantStats[];
  priceHistory: ItemPricePoint[];
};

export type ItemGroupData = {
  id: string;
  canonicalName: string;
  rawNames: string[];
  source: string;
};

// Shopping Basket types

export type ShoppingListData = {
  id: string;
  name: string;
  itemCount: number;
  createdAt: string;
};

export type ShoppingListDetail = {
  id: string;
  name: string;
  items: ShoppingListItemData[];
};

export type ShoppingListItemData = {
  id: string;
  itemName: string;
  normalizedName: string;
  quantity: number;
};

export type BasketMerchantResult = {
  merchant: string;
  items: BasketItemResult[];
  availableTotal: number;
  availableCount: number;
  unavailableCount: number;
};

export type BasketItemResult = {
  itemName: string;
  quantity: number;
  avgPrice: number | null;
  totalPrice: number | null;
  purchaseCount: number;
};

export type SplitStoreAssignment = {
  merchant: string;
  items: { itemName: string; quantity: number; totalPrice: number }[];
  storeTotal: number;
};

export type SplitStrategy = {
  assignments: SplitStoreAssignment[];
  splitTotal: number;
  savings: number; // vs cheapest single store
  storeCount: number;
  unavailableItems: string[]; // items with no data at any merchant
};

export type BasketAnalysis = {
  merchants: BasketMerchantResult[];
  cheapestMerchant: string | null;
  cheapestTotal: number | null;
  splitStrategy: SplitStrategy | null;
};

// Weekend Planner types

export type UserPreferenceData = {
  entertainment: string[];
  food: string[];
  likes: string[];
  city: string;
  companionType: string;
};

export type WeekendActivity = {
  name: string;
  description: string;
  timeSlot: string;
  duration: string;
  estimatedCost: number;
  category: string;
  location: string;
  area: string;
  mapUrl: string;
};

export type WeekendFoodSuggestion = {
  meal: string;
  name: string;
  restaurant: string;
  type: string;
  estimatedCost: number;
  description: string;
  area: string;
  mapUrl: string;
};

export type WeekendOffer = {
  title: string;
  summary: string;
  totalCost: number;
  activities: WeekendActivity[];
  food: WeekendFoodSuggestion[];
  tips: string[];
};

export type WeekendPlanData = {
  id: string;
  weekLabel: string;
  offers: WeekendOffer[];
  ratings: WeekendPlanRatings;
  linkedTransactionIds: string[];
  createdAt: string;
};

export type ItemRating = "like" | "dislike";
export type WeekendPlanRatings = Record<string, ItemRating>;

export type WeekendSpendingComparison = {
  estimatedTotal: number;
  actualTotal: number;
  difference: number;
  linkedTransactions: {
    id: string;
    merchant: string | null;
    amount: number;
    date: string;
    category: string | null;
  }[];
};

export const UAE_CITIES = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
] as const;

export const COMPANION_TYPES = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
] as const;

// Currency types

export type CurrencyData = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rateToUsd: number;
  isActive: boolean;
};

// Profile types

export type IncomeSourceData = {
  id: string;
  name: string;
  amount: number;
  depositDay: number;
  currency: string;
  isActive: boolean;
  lastReceivedAt: string | null;
};

export type IncomeDepositData = {
  id: string;
  amount: number;
  note: string | null;
  receivedAt: string;
  transactionId: string | null;
  transactionMerchant: string | null;
  transactionDate: string | null;
};

export type ReserveData = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: string;
  location: string;
  note: string | null;
  ticker: string | null;
  quantity: number | null;
  purchasePrice: number | null;
  lastRecordedAt: string | null;
};

export type ReserveSnapshotData = {
  id: string;
  amount: number;
  note: string | null;
  recordedAt: string;
};

export type InstallmentData = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  dueDay: number;
  totalCount: number | null;
  paidCount: number;
  isActive: boolean;
  reminderDays: number;
  paymentInstructions: string | null;
  lastPaidAt: string | null;
};

export type InstallmentPaymentData = {
  id: string;
  amount: number;
  note: string | null;
  paidAt: string;
  transactionId: string | null;
  transactionMerchant: string | null;
  transactionDate: string | null;
};

export type BillData = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  dueDay: number;
  isActive: boolean;
  reminderDays: number;
  paymentInstructions: string | null;
  lastPaidAt: string | null;
  lastPaidAmount: number | null;
};

export type BillPaymentData = {
  id: string;
  amount: number;
  note: string | null;
  paidAt: string;
  transactionId: string | null;
  transactionMerchant: string | null;
  transactionDate: string | null;
};

export type FinancialOverview = {
  totalMonthlyIncome: number;
  totalMonthlyInstallments: number;
  totalMonthlyBills: number;
  netMonthlyCashflow: number;
  totalReserves: number;
  reservesByType: { type: string; currency: string; total: number }[];
  upcomingPayments: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    dueDay: number;
    daysUntilDue: number;
    kind: "installment" | "bill";
  }[];
};

// Subscription Detection types

export type DetectedSubscription = {
  merchant: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "weekly" | "yearly";
  confidence: number;
  occurrences: number;
  lastDate: string;
  firstDate: string;
  categoryName: string | null;
};

// Household types

export type HouseholdData = {
  id: string;
  name: string;
  members: HouseholdMemberData[];
  pendingInvites: HouseholdInviteData[];
};

export type HouseholdMemberData = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
};

export type HouseholdInviteData = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
};

export type HouseholdTransactionData = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  merchant: string | null;
  description: string | null;
  categoryName: string | null;
  accountName: string;
  userName: string;
};

// Cashflow Calendar types

export type CashflowEvent = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  day: number;
  kind: "income" | "installment" | "bill" | "expense" | "deposit";
};

export type CashflowDayData = {
  date: string; // YYYY-MM-DD
  day: number;
  events: CashflowEvent[];
  projectedBalance: number;
};

export type CashflowData = {
  month: string; // YYYY-MM
  primaryCurrency: string;
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  days: CashflowDayData[];
};

// Bill Negotiator types

// Money Pilot types

export type MoneyPilotScoreBreakdown = {
  savingsRate: { score: number; max: number; detail: string };
  emergencyFund: { score: number; max: number; detail: string };
  diversification: { score: number; max: number; detail: string };
  debtRatio: { score: number; max: number; detail: string };
  passiveIncome: { score: number; max: number; detail: string };
};

export type MoneyPilotProjections = {
  oneYear: number;
  threeYear: number;
  fiveYear: number;
  assumptions: string;
};

export type MoneyPilotAction = {
  id: string;
  category: "quick_win" | "monthly_habit" | "growth_move" | "trade_signal" | "expense_hack";
  title: string;
  description: string;
  platform: string | null;
  expectedReturn: string;
  risk: "low" | "medium" | "high";
  timeline: "tomorrow" | "this_week" | "this_month" | "next_3_months";
  steps: string[];
};

export type InvestmentSuggestion = {
  title: string;
  description: string;
  potentialMonthly: number | null;
  potentialYearly: number | null;
  risk: "low" | "medium" | "high";
  relatedReserve: string | null;
};

export type InvestmentSuggestions = {
  emergencyFundNeeded: number;
  emergencyFundCurrent: number;
  investableAmount: number;
  suggestions: InvestmentSuggestion[];
};

export type MoneyPilotResult = {
  wealthScore: number;
  scoreBreakdown: MoneyPilotScoreBreakdown;
  monthlySurplus: number;
  investableCapital: number;
  projections: MoneyPilotProjections;
  actions: MoneyPilotAction[];
  investmentSuggestions?: InvestmentSuggestions;
  summary: string;
};

export type MoneyPilotHistoryItem = MoneyPilotResult & {
  id: string;
  completedActions: string[];
  createdAt: string;
};

// Bill Negotiator types

export type BillNegotiatorRecommendation = {
  title: string;
  description: string;
  category: "subscription" | "bill" | "installment" | "duplicate" | "overpriced";
  currentAmount: number;
  suggestedAmount: number | null;
  monthlySavings: number;
  yearlySavings: number;
  confidence: "high" | "medium" | "low";
  priority: "high" | "medium" | "low";
  actionSteps: string[];
};

export type BillNegotiatorResult = {
  totalMonthlySavings: number;
  totalYearlySavings: number;
  recommendations: BillNegotiatorRecommendation[];
};

export type BillNegotiatorHistoryItem = BillNegotiatorResult & {
  id: string;
  createdAt: string;
};

export type SuggestedTransaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: string | null;
  description: string | null;
  isSuggested: boolean;
};

export type ActivePaymentTarget = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: "installment" | "bill" | "income";
};
