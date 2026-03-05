"use client";

import { useState, useEffect, useRef } from "react";
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
  getTransactionItems,
  saveTransactionItems,
} from "@/actions/transactions";
import { parseReceiptFromUpload } from "@/actions/ai";
import type { TransactionWithCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Loader2, Upload, Sparkles, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAiCheck, AiSetupDialog } from "@/components/ai-setup-dialog";

type ItemRow = {
  name: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
};

function emptyRow(): ItemRow {
  return { name: "", quantity: "1", unitPrice: "", totalPrice: "" };
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(path);
}

export function ItemsDialog({
  transaction,
  open,
  onOpenChange,
  onSaved,
}: {
  transaction: TransactionWithCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const txAmount = transaction.amount ?? 0;
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<string[]>(transaction.mediaFiles ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { checkAi, showSetup, setShowSetup } = useAiCheck();

  useEffect(() => {
    if (!open) return;
    setMediaFiles(transaction.mediaFiles ?? []);
    setLoading(true);
    getTransactionItems(transaction.id).then((items) => {
      if (items.length > 0) {
        setRows(
          items.map((item) => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice != null ? item.unitPrice.toString() : "",
            totalPrice: item.totalPrice.toString(),
          })),
        );
      } else {
        setRows([]);
      }
      setLoading(false);
    });
  }, [open, transaction.id, transaction.mediaFiles]);

  const updateRow = (idx: number, field: keyof ItemRow, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [field]: value };

      // Auto-calculate totalPrice when quantity or unitPrice changes
      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(row.quantity) || 0;
        const unit = parseFloat(row.unitPrice);
        if (!isNaN(unit) && unit > 0) {
          row.totalPrice = (qty * unit).toFixed(2);
        }
      }

      next[idx] = row;
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
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

  const handleExtract = async () => {
    if (!checkAi()) return;
    const images = mediaFiles.filter(isImage);
    if (images.length === 0) {
      toast.error("❌ No image files to extract from");
      return;
    }

    setExtracting(true);
    const result = await parseReceiptFromUpload(transaction.id);

    if ("error" in result) {
      toast.error(`❌ ${result.error}`);
    } else if (result.items.length === 0) {
      toast.error("❌ No items found in the receipt");
    } else {
      const newRows: ItemRow[] = result.items.map((item) => ({
        name: item.name,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice != null ? item.unitPrice.toString() : "",
        totalPrice: item.totalPrice.toString(),
      }));

      if (rows.length === 0 || rows.every((r) => !r.name.trim())) {
        setRows(newRows);
      } else {
        setRows((prev) => [...prev, ...newRows]);
      }
      toast.success(`✅ Extracted ${result.items.length} item(s) from receipt`);
    }

    setExtracting(false);
  };

  const handleRemoveMedia = async (filePath: string) => {
    setMediaFiles((prev) => prev.filter((f) => f !== filePath));
  };

  const itemsTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.totalPrice) || 0),
    0,
  );
  const totalMatch = Math.abs(itemsTotal - txAmount) < 0.01;

  const isValid = rows.every(
    (r) => r.name.trim() !== "" && parseFloat(r.totalPrice) > 0,
  );

  const imageFiles = mediaFiles.filter(isImage);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveTransactionItems(
      transaction.id,
      rows.map((r) => ({
        name: r.name.trim(),
        quantity: parseFloat(r.quantity) || 1,
        unitPrice: r.unitPrice ? parseFloat(r.unitPrice) : null,
        totalPrice: parseFloat(r.totalPrice),
      })),
    );

    if ("error" in result) {
      toast.error(
        `❌ ${typeof result.error === "string" ? result.error : "Failed to save items"}`,
      );
    } else {
      toast.success(
        rows.length > 0
          ? `✅ Saved ${rows.length} item${rows.length > 1 ? "s" : ""}`
          : "✅ Items cleared",
      );
      onOpenChange(false);
      onSaved();
    }
    setSaving(false);
  };

  return (
    <>
    <AiSetupDialog open={showSetup} onOpenChange={setShowSetup} />
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-xl sm:max-h-[85vh] sm:flex sm:flex-col">
        <ResponsiveDialogHeader className="shrink-0">
          <ResponsiveDialogTitle>Items</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 py-2 sm:overflow-y-auto sm:min-h-0">
            {/* Receipt upload */}
            <div className="rounded-lg border border-dashed p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {mediaFiles.length > 0
                    ? `${mediaFiles.length} file${mediaFiles.length > 1 ? "s" : ""} attached`
                    : "No receipt uploaded"}
                </span>
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
                  className="h-7 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-3 w-3" />
                  )}
                  Upload
                </Button>
              </div>
              {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mediaFiles.map((file) => {
                    const name = file.split("/").pop() ?? file;
                    return (
                      <span
                        key={file}
                        className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px]"
                      >
                        <ImageIcon className="h-2.5 w-2.5 shrink-0" />
                        <span className="max-w-[100px] truncate">{name}</span>
                        <button
                          onClick={() => handleRemoveMedia(file)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {imageFiles.length > 0 && (
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleExtract}
                disabled={extracting}
              >
                {extracting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-1.5 h-4 w-4" />
                )}
                Extract Items from Receipt
              </Button>
            )}

            {/* Item rows */}
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_3rem_4rem_4rem_2rem] items-end gap-1.5 sm:grid-cols-[1fr_4rem_5rem_5rem_2rem]"
              >
                <div>
                  {idx === 0 && <Label className="text-[10px] text-muted-foreground">Name</Label>}
                  <Input
                    className="h-8 text-sm"
                    value={row.name}
                    onChange={(e) => updateRow(idx, "name", e.target.value)}
                    placeholder="Item"
                  />
                </div>
                <div>
                  {idx === 0 && <Label className="text-[10px] text-muted-foreground">Qty</Label>}
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    className="h-8 text-sm px-1.5"
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  {idx === 0 && <Label className="text-[10px] text-muted-foreground">Price</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8 text-sm px-1.5"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(idx, "unitPrice", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  {idx === 0 && <Label className="text-[10px] text-muted-foreground">Total</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8 text-sm px-1.5"
                    value={row.totalPrice}
                    onChange={(e) =>
                      updateRow(idx, "totalPrice", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeRow(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Item
            </Button>

            {rows.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                <span>Items: {formatCurrency(itemsTotal)}</span>
                <span className="text-muted-foreground">
                  Tx: {formatCurrency(txAmount)}
                </span>
                <span className={totalMatch ? "text-green-600" : "text-amber-500"}>
                  {totalMatch ? "✓ Match" : "✗ Mismatch"}
                </span>
              </div>
            )}
          </div>
        )}

        <ResponsiveDialogFooter className="shrink-0">
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || loading || (rows.length > 0 && !isValid)}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
    </>
  );
}
