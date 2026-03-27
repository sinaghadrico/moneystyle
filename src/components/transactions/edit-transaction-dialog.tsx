"use client";

import { useState, useRef, useCallback } from "react";
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
import { Upload, X, Loader2, FileIcon, ImageIcon, Link, Unlink, MapPin } from "lucide-react";
import { LocationPicker } from "./location-picker";
import { FeatureInfo } from "@/components/ui/feature-info";
import { SPREAD_MONTHS_INFO } from "@/lib/feature-info-content";
import { Badge } from "@/components/ui/badge";
import {
  getActiveInstallmentsAndBills,
  linkTransactionToNewPayment,
  unlinkTransactionFromPayment,
} from "@/actions/profile";
import type { ActivePaymentTarget } from "@/lib/types";
import type { TransactionPaymentLink } from "@/lib/types";

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
    location: (transaction as Record<string, unknown>).location as string ?? "",
    latitude: (transaction as Record<string, unknown>).latitude as number | null ?? null,
    longitude: (transaction as Record<string, unknown>).longitude as number | null ?? null,
    tagIds: transaction.tags?.map((t) => t.id) ?? [],
    spreadMonths: transaction.spreadMonths?.toString() ?? "",
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Payment link state
  const [paymentLink, setPaymentLink] = useState<TransactionPaymentLink | null>(
    transaction.paymentLink ?? null
  );
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [targets, setTargets] = useState<ActivePaymentTarget[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [linkingSaving, setLinkingSaving] = useState(false);

  const handleShowLinkPicker = async () => {
    setShowLinkPicker(true);
    if (targets.length === 0) {
      setLoadingTargets(true);
      const data = await getActiveInstallmentsAndBills();
      setTargets(data);
      setLoadingTargets(false);
    }
  };

  const handleLinkToTarget = async (target: ActivePaymentTarget) => {
    setLinkingSaving(true);
    const result = await linkTransactionToNewPayment(transaction.id, target.id, target.type);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Linked to ${target.name}`);
      setPaymentLink({
        type: target.type,
        paymentId: "", // will be refreshed on next load
        parentId: target.id,
        parentName: target.name,
      });
      setShowLinkPicker(false);
    }
    setLinkingSaving(false);
  };

  const handleUnlinkPayment = async () => {
    if (!paymentLink) return;
    setLinkingSaving(true);
    const result = await unlinkTransactionFromPayment(paymentLink.paymentId, paymentLink.type);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Payment unlinked");
      setPaymentLink(null);
    }
    setLinkingSaving(false);
  };

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
      location: form.location || null,
      latitude: form.latitude,
      longitude: form.longitude,
      tagIds: form.tagIds,
      spreadMonths: form.spreadMonths ? Number(form.spreadMonths) : null,
    });

    if (result.error) {
      toast.error("❌ Failed to update transaction");
    } else {
      toast.success("✅ Transaction updated");
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
          toast.error(`❌ ${data.error || "Upload failed"}`);
        } else {
          setMediaFiles((prev) => [...prev, data.path]);
          toast.success(`📎 Uploaded ${file.name}`);
        }
      } catch {
        toast.error(`❌ Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = async (filePath: string) => {
    const result = await removeTransactionMedia(transaction.id, filePath);
    if ("error" in result) {
      toast.error(`❌ ${result.error}`);
    } else {
      setMediaFiles((prev) => prev.filter((f) => f !== filePath));
      toast.success("🗑️ File removed");
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Transaction</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="grid gap-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Location</Label>
              <div className="flex gap-1.5">
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="e.g. Dubai Mall"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9"
                  onClick={() => setShowLocationPicker(true)}
                  title="Pick on map"
                >
                  <MapPin className={`h-3.5 w-3.5 ${form.latitude ? "text-emerald-500" : ""}`} />
                </Button>
              </div>
              {form.latitude && (
                <p className="text-[10px] text-muted-foreground">
                  📍 {form.latitude.toFixed(4)}, {form.longitude?.toFixed(4)}
                </p>
              )}
              <LocationPicker
                open={showLocationPicker}
                onOpenChange={setShowLocationPicker}
                initialLat={form.latitude}
                initialLng={form.longitude}
                initialLocation={form.location}
                onConfirm={(data) => {
                  setForm((f) => ({
                    ...f,
                    location: data.location,
                    latitude: data.latitude,
                    longitude: data.longitude,
                  }));
                }}
              />
            </div>
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

          {/* Linked Payment section */}
          <div className="grid gap-2">
            <Label>Linked Payment</Label>
            {paymentLink ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Link className="h-3 w-3" />
                  {paymentLink.parentName}
                  <span className="text-muted-foreground capitalize">
                    ({paymentLink.type})
                  </span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={handleUnlinkPayment}
                  disabled={linkingSaving}
                >
                  <Unlink className="h-3 w-3 mr-1" />
                  Unlink
                </Button>
              </div>
            ) : showLinkPicker ? (
              <div className="border rounded-lg p-2 space-y-1">
                {loadingTargets ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : targets.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No active income sources, installments, or bills.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {targets.map((target) => (
                      <button
                        key={`${target.type}-${target.id}`}
                        type="button"
                        className="w-full flex items-center justify-between rounded-md border p-2 text-left text-xs hover:bg-muted/50 transition-colors"
                        onClick={() => handleLinkToTarget(target)}
                        disabled={linkingSaving}
                      >
                        <div>
                          <p className="font-medium">{target.name}</p>
                          <p className="text-muted-foreground capitalize">{target.type}</p>
                        </div>
                        <p className="font-medium shrink-0 ml-2">
                          {target.amount} {target.currency}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs w-full"
                  onClick={() => setShowLinkPicker(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowLinkPicker}
                className="w-fit"
              >
                <Link className="mr-1 h-3.5 w-3.5" />
                Link to Income/Installment/Bill
              </Button>
            )}
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
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
