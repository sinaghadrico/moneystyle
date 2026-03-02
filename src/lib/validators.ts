import { z } from "zod";

export const transactionUpdateSchema = z.object({
  amount: z.coerce.number().nullable().optional(),
  currency: z.string().min(1).max(5).optional(),
  type: z.enum(["income", "expense", "transfer", "other"]).optional(),
  categoryId: z.string().nullable().optional(),
  accountId: z.string().optional(),
  merchant: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;

export const transactionCreateSchema = z.object({
  date: z.coerce.date(),
  time: z.string().nullable().optional(),
  amount: z.coerce.number().nullable().optional(),
  currency: z.string().default("AED"),
  type: z.enum(["income", "expense", "transfer", "other"]),
  categoryId: z.string().nullable().optional(),
  accountId: z.string().min(1, "Account is required"),
  merchant: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export const accountCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bank: z.string().max(100).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
});

export const accountUpdateSchema = accountCreateSchema.partial();

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;

export const tagCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
});

export type TagCreateInput = z.infer<typeof tagCreateSchema>;

export const budgetUpsertSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  monthlyLimit: z.coerce.number().positive("Limit must be positive"),
  alertThreshold: z.coerce.number().int().min(1).max(100).default(80),
});

export type BudgetUpsertInput = z.infer<typeof budgetUpsertSchema>;

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: z.coerce.number().positive("Target must be positive"),
  deadline: z.coerce.date().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").default("#10b981"),
});

export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;

export const splitTransactionSchema = z.object({
  transactionId: z.string().min(1),
  splits: z.array(z.object({
    categoryId: z.string().nullable().optional(),
    personId: z.string().nullable().optional(),
    amount: z.coerce.number().positive("Amount must be positive"),
    description: z.string().nullable().optional(),
  })).min(2, "Need at least 2 splits"),
});

export type SplitTransactionInput = z.infer<typeof splitTransactionSchema>;

export const personCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
});

export const personUpdateSchema = personCreateSchema.partial();

export type PersonCreateInput = z.infer<typeof personCreateSchema>;
export type PersonUpdateInput = z.infer<typeof personUpdateSchema>;

export const settlementCreateSchema = z.object({
  personId: z.string().min(1, "Person is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  note: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export type SettlementCreateInput = z.infer<typeof settlementCreateSchema>;

export const smsPatternCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  regex: z.string().min(1, "Regex is required"),
  type: z.enum(["income", "expense", "auto"]),
  priority: z.coerce.number().int().min(0).max(100).default(50),
  amountCaptureGroup: z.coerce.number().int().min(1).default(1),
  merchantCaptureGroup: z.coerce.number().int().min(1).nullable().optional(),
  enabled: z.boolean().default(true),
  creditKeywords: z.string().nullable().optional(),
});

export const smsPatternUpdateSchema = smsPatternCreateSchema.partial();

export type SmsPatternCreateInput = z.infer<typeof smsPatternCreateSchema>;
export type SmsPatternUpdateInput = z.infer<typeof smsPatternUpdateSchema>;

export const transactionItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().positive("Quantity must be positive").default(1),
  unitPrice: z.coerce.number().nullable().optional(),
  totalPrice: z.coerce.number().positive("Total price must be positive"),
});

export const saveTransactionItemsSchema = z.object({
  transactionId: z.string().min(1),
  items: z.array(transactionItemSchema),
});

export type SaveTransactionItemsInput = z.infer<typeof saveTransactionItemsSchema>;

export const itemGroupUpdateSchema = z.object({
  canonicalName: z.string().min(1, "Name is required").max(200),
  rawNames: z.array(z.string().min(1)).min(1, "At least one item name required"),
});

export type ItemGroupUpdateInput = z.infer<typeof itemGroupUpdateSchema>;

export const shoppingListSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const shoppingListItemSchema = z.object({
  itemName: z.string().min(1).max(200),
  quantity: z.coerce.number().positive().default(1),
});

// Profile validators

export const incomeSourceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive"),
  depositDay: z.coerce.number().int().min(1).max(31).default(1),
  currency: z.string().min(1).max(5).default("AED"),
  isActive: z.boolean().default(true),
});

export const incomeSourceUpdateSchema = incomeSourceSchema.partial();

export type IncomeSourceInput = z.infer<typeof incomeSourceSchema>;

export const reserveSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1).max(5).default("AED"),
  type: z.enum(["cash", "gold", "crypto", "family", "other"]),
  location: z.string().min(1, "Location is required").max(200),
  note: z.string().max(500).nullable().optional(),
});

export const reserveUpdateSchema = reserveSchema.partial();

export type ReserveInput = z.infer<typeof reserveSchema>;

export const recordReserveValueSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  note: z.string().max(500).nullable().optional(),
});

export const installmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1).max(5).default("AED"),
  dueDay: z.coerce.number().int().min(1).max(31).default(1),
  totalCount: z.coerce.number().int().positive().nullable().optional(),
  paidCount: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  reminderDays: z.coerce.number().int().min(0).max(30).default(2),
});

export const installmentUpdateSchema = installmentSchema.partial();

export type InstallmentInput = z.infer<typeof installmentSchema>;

// Currency validators

export const currencyCreateSchema = z.object({
  code: z.string().min(1, "Code is required").max(5).toUpperCase(),
  name: z.string().min(1, "Name is required").max(100),
  symbol: z.string().min(1, "Symbol is required").max(10),
  rateToUsd: z.coerce.number().positive("Rate must be positive"),
  isActive: z.boolean().default(true),
});

export const currencyUpdateSchema = currencyCreateSchema.partial();

export type CurrencyCreateInput = z.infer<typeof currencyCreateSchema>;
export type CurrencyUpdateInput = z.infer<typeof currencyUpdateSchema>;

export const settingsUpdateSchema = z.object({
  currency: z.string().min(1).max(5).optional(),
  defaultPageSize: z.coerce.number().int().min(5).max(100).optional(),
  defaultAccountId: z.string().nullable().optional(),
  defaultTransactionType: z.enum(["income", "expense", "transfer", "other"]).optional(),
  defaultDashboardPeriod: z.enum(["all", "3m", "6m", "1y"]).optional(),
  autoCategorize: z.boolean().optional(),
  telegramEnabled: z.boolean().optional(),
  telegramBotToken: z.string().nullable().optional(),
  telegramWebhookSecret: z.string().nullable().optional(),
  telegramChatId: z.string().nullable().optional(),
  smsApiKey: z.string().nullable().optional(),
  aiEnabled: z.boolean().optional(),
  openaiApiKey: z.string().nullable().optional(),
});
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
