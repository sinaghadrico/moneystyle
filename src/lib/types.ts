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

export type TransactionWithCategory = Omit<Transaction, "amount"> & {
  amount: number | null;
  category: Category | null;
  account: Account;
  tags: TagData[];
  splits?: TransactionSplitData[];
  lineItemCount?: number;
};

export type AccountWithStats = {
  id: string;
  name: string;
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
  targetAmount: number;
  currentAmount: number;
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

export type BasketAnalysis = {
  merchants: BasketMerchantResult[];
  cheapestMerchant: string | null;
  cheapestTotal: number | null;
};
