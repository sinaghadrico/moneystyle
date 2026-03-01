import { z } from "zod";

export const transactionUpdateSchema = z.object({
  amount: z.coerce.number().nullable().optional(),
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
