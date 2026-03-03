"use client";

import { useState, useRef } from "react";
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
import { updateTransaction, removeTransactionMedia } from "@/actions/transactions";
import type { TransactionWithCategory } from "@/lib/types";
import type { Category, Account } from "@prisma/client";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Upload, X, Loader2, FileIcon, ImageIcon } from "lucide-react";

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(path);
}

export function EditTransactionDialog({
  transaction,
  categories,
  accounts,
  open,
  onOpenChange,
  onSuccess,
}: {
  transaction: TransactionWithCategory;
  categories: Category[];
  accounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<string[]>(transaction.mediaFiles ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    amount: transaction.amount?.toString() ?? "",
    currency: transaction.currency ?? "AED",
    type: transaction.type,
    categoryId: transaction.categoryId ?? "",
    accountId: transaction.accountId,
    merchant: transaction.merchant ?? "",
    description: transaction.description ?? "",
    tagIds: transaction.tags?.map((t) => t.id) ?? [],
    spreadMonths: transaction.spreadMonths?.toString() ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    const result = await updateTransaction(transaction.id, {
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

    if (result.error) {
      toast.error("Failed to update transaction");
    } else {
      toast.success("Transaction updated");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("transactionId", transaction.id);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Upload failed");
        } else {
          setMediaFiles((prev) => [...prev, data.path]);
          toast.success(`Uploaded ${file.name}`);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = async (filePath: string) => {
    const result = await removeTransactionMedia(transaction.id, filePath);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setMediaFiles((prev) => prev.filter((f) => f !== filePath));
      toast.success("File removed");
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Transaction</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <CurrencySelect
                value={form.currency}
                onValueChange={(v) => setForm({ ...form, currency: v })}
              />
            </div>
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
            />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-spread-toggle"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={!!form.spreadMonths}
                onChange={(e) =>
                  setForm({ ...form, spreadMonths: e.target.checked ? "3" : "" })
                }
              />
              <Label htmlFor="edit-spread-toggle" className="mb-0">Spread across months</Label>
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

          {/* Files section */}
          <div className="grid gap-2">
            <Label>Files</Label>
            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {mediaFiles.map((file) => {
                  const name = file.split("/").pop() ?? file;
                  return (
                    <span
                      key={file}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                    >
                      {isImage(file) ? (
                        <ImageIcon className="h-3 w-3 shrink-0" />
                      ) : (
                        <FileIcon className="h-3 w-3 shrink-0" />
                      )}
                      <span className="max-w-[120px] truncate">{name}</span>
                      <button
                        onClick={() => handleRemoveFile(file)}
                        className="ml-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-1 h-3.5 w-3.5" />
                )}
                Add File
              </Button>
            </div>
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
