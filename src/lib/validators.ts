import { z } from "zod";

export const transactionUpdateSchema = z.object({
  amount: z.coerce.number().nullable().optional(),
  type: z.enum(["income", "expense", "transfer", "other"]).optional(),
  categoryId: z.string().nullable().optional(),
  accountId: z.string().optional(),
  merchant: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
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
