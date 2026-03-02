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
