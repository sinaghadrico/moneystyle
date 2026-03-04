"use client";

import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { createTransaction } from "@/actions/transactions";
import type { Category, Account } from "@prisma/client";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useAppSettings } from "@/components/settings/settings-provider";
import { FeatureInfo } from "@/components/ui/feature-info";
import { SPREAD_MONTHS_INFO } from "@/lib/feature-info-content";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeStr() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AddTransactionDialog({
  categories,
  accounts,
  open,
  onOpenChange,
  onSuccess,
}: {
  categories: Category[];
  accounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { settings } = useAppSettings();
  const [saving, setSaving] = useState(false);
  const defaultAccId = settings.defaultAccountId
    && accounts.some((a) => a.id === settings.defaultAccountId)
    ? settings.defaultAccountId
    : accounts[0]?.id ?? "";
  const [form, setForm] = useState({
    date: todayStr(),
    time: nowTimeStr(),
    amount: "",
    currency: settings.currency || "AED",
    type: settings.defaultTransactionType || "expense",
    categoryId: "",
    accountId: defaultAccId,
    merchant: "",
    description: "",
    tagIds: [] as string[],
    spreadMonths: "",
  });

  const handleSave = async () => {
    setSaving(true);
    const result = await createTransaction({
      date: form.date,
      time: form.time || null,
      amount: form.amount ? Number(form.amount) : null,
      currency: form.currency,
      type: form.type,
      categoryId: form.categoryId || null,
      accountId: form.accountId,
      merchant: form.merchant || null,
      description: form.description || null,
      tagIds: form.tagIds,
      spreadMonths: form.spreadMonths ? Number(form.spreadMonths) : null,
    });

    if ("error" in result) {
      const msg = Object.values(result.error).flat().join(", ");
      toast.error(`❌ ${msg}`);
    } else {
      toast.success("✅ Transaction created");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add Transaction</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-1 min-w-0">
              <Label>Currency</Label>
              <CurrencySelect
                value={form.currency}
                onValueChange={(v) => setForm({ ...form, currency: v })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Account</Label>
              <Select
                value={form.accountId}
                onValueChange={(v) => setForm({ ...form, accountId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Category</Label>
              <Select
                value={form.categoryId || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, categoryId: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Merchant</Label>
              <Input
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                placeholder="Merchant name"
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="spread-toggle"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={!!form.spreadMonths}
                onChange={(e) =>
                  setForm({ ...form, spreadMonths: e.target.checked ? "3" : "" })
                }
              />
              <Label htmlFor="spread-toggle" className="mb-0">Spread across months</Label>
              <FeatureInfo content={SPREAD_MONTHS_INFO} />
            </div>
            {form.spreadMonths && (
              <div className="space-y-1">
                <Input
                  type="number"
                  min={2}
                  max={24}
                  value={form.spreadMonths}
                  onChange={(e) => setForm({ ...form, spreadMonths: e.target.value })}
                  placeholder="Number of months"
                />
                {form.amount && Number(form.spreadMonths) >= 2 && (
                  <p className="text-xs text-muted-foreground">
                    Monthly: {(Number(form.amount) / Number(form.spreadMonths)).toFixed(2)} {form.currency}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagInput
              value={form.tagIds}
              onChange={(tagIds) => setForm({ ...form, tagIds })}
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !form.accountId || !form.date}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
