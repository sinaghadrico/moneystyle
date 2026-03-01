"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: todayStr(),
    time: nowTimeStr(),
    amount: "",
    type: "expense",
    categoryId: "",
    accountId: accounts[0]?.id ?? "",
    merchant: "",
    description: "",
    tagIds: [] as string[],
  });

  const handleSave = async () => {
    setSaving(true);
    const result = await createTransaction({
      date: form.date,
      time: form.time || null,
      amount: form.amount ? Number(form.amount) : null,
      type: form.type,
      categoryId: form.categoryId || null,
      accountId: form.accountId,
      merchant: form.merchant || null,
      description: form.description || null,
      tagIds: form.tagIds,
    });

    if ("error" in result) {
      const msg = Object.values(result.error).flat().join(", ");
      toast.error(msg);
    } else {
      toast.success("Transaction created");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Amount (AED)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label>Account</Label>
            <Select
              value={form.accountId}
              onValueChange={(v) => setForm({ ...form, accountId: v })}
            >
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={form.categoryId || "none"}
              onValueChange={(v) =>
                setForm({ ...form, categoryId: v === "none" ? "" : v })
              }
            >
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label>Merchant</Label>
            <Input
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              placeholder="Merchant name"
            />
          </div>
          <div className="grid gap-2">
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
            <Label>Tags</Label>
            <TagInput
              value={form.tagIds}
              onChange={(tagIds) => setForm({ ...form, tagIds })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.accountId || !form.date}
          >
            {saving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
