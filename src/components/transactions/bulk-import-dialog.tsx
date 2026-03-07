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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTransactionFromReceipt,
  parseTransactionsFromCSV,
  bulkCreateTransactions,
} from "@/actions/bulk-import";
import type {
  ParsedTransaction,
  ParsedReceipt,
  ParsedReceiptItem,
} from "@/lib/bulk-import-types";
import type { Account, Category } from "@prisma/client";
import { toast } from "sonner";
import { useAppSettings } from "@/components/settings/settings-provider";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  Check,
  CheckCheck,
  Loader2,
  Download,
  Pencil,
  X,
} from "lucide-react";

type Step = "upload" | "review" | "done";
type Mode = "ai" | "csv";
type ReceiptEntry = {
  id: string;
  receipt: ParsedReceipt;
  categoryId: string;
  storedPath: string | null;
};



export function BulkImportDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
}) {
  const { settings } = useAppSettings();
  const [step, setStep] = useState<Step>("upload");
  const [mode, setMode] = useState<Mode>("csv");
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState(
    settings.defaultAccountId || accounts[0]?.id || "",
  );

  // AI receipt state (multi-file)
  const [receipts, setReceipts] = useState<ReceiptEntry[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

  // CSV state
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Progress for multi-file
  const [parseProgress, setParseProgress] = useState({ current: 0, total: 0 });

  const [importCount, setImportCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setMode("csv");
    setLoading(false);
    setReceipts([]);
    setEditingItemId(null);
    setExpandedReceiptId(null);
    setTransactions([]);
    setSelected(new Set());
    setEditingTxId(null);
    setParseProgress({ current: 0, total: 0 });
    setImportCount(0);
  }

  // Match a raw category name (from AI or CSV) to user's categories
  function matchCategory(raw?: string): string {
    if (!raw) return "";
    const lower = raw.toLowerCase();
    // Exact match
    const exact = categories.find((c) => c.name.toLowerCase() === lower);
    if (exact) return exact.name;
    // Partial: category name includes the raw or raw includes category name
    const partial = categories.find(
      (c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()),
    );
    return partial ? partial.name : "";
  }

  function matchTransactionCategories(txs: ParsedTransaction[]): ParsedTransaction[] {
    return txs.map((t) => ({ ...t, category: matchCategory(t.category) }));
  }

  async function processOneFile(file: File): Promise<{
    receipt?: ReceiptEntry;
    transactions?: ParsedTransaction[];
    error?: string;
  }> {
    // Use API route (FormData) instead of server action to avoid body size limit
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-receipt", { method: "POST", body: formData });
    const result = await res.json();
    if (!res.ok || "error" in result) return { error: result.error || "Failed to parse" };

    if (result.result.kind === "receipt") {
      return {
        receipt: {
          id: `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          receipt: result.result.receipt,
          categoryId: "",
          storedPath: result.storedPath || null,
        },
      };
    }
    return { transactions: result.result.transactions };
  }

  async function handleFiles(files: FileList) {
    setLoading(true);

    if (mode === "csv") {
      // CSV: only first file
      try {
        const text = await files[0].text();
        const result = await parseTransactionsFromCSV(text);
        if ("error" in result) {
          toast.error(result.error);
          setLoading(false);
          return;
        }
        const matched = matchTransactionCategories(result.transactions);
        setTransactions(matched);
        setSelected(new Set(matched.map((t) => t.id)));
        setStep("review");
      } catch {
        toast.error("Failed to parse CSV file.");
      }
      setLoading(false);
      return;
    }

    // AI mode: process multiple files sequentially
    const fileArray = Array.from(files);
    setParseProgress({ current: 0, total: fileArray.length });
    const newReceipts: ReceiptEntry[] = [];
    const newTransactions: ParsedTransaction[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      setParseProgress({ current: i + 1, total: fileArray.length });
      try {
        const result = await processOneFile(fileArray[i]);
        if (result.error) {
          errors.push(`${fileArray[i].name}: ${result.error}`);
        } else if (result.receipt) {
          newReceipts.push(result.receipt);
        } else if (result.transactions) {
          const matched = matchTransactionCategories(result.transactions);
          newTransactions.push(...matched);
        }
      } catch (e) {
        errors.push(`${fileArray[i].name}: ${e instanceof Error ? e.message : "Failed to process"}`);
      }
    }

    if (errors.length > 0) {
      for (const err of errors) {
        toast.error(err);
      }
    }

    if (newReceipts.length === 0 && newTransactions.length === 0) {
      setLoading(false);
      setParseProgress({ current: 0, total: 0 });
      return;
    }

    if (newReceipts.length > 0) {
      setReceipts(newReceipts);
      setExpandedReceiptId(newReceipts[0].id);
    }
    if (newTransactions.length > 0) {
      setTransactions(newTransactions);
    }
    // Auto-select all
    const allIds = [
      ...newReceipts.map((r) => r.id),
      ...newTransactions.map((t) => t.id),
    ];
    setSelected(new Set(allIds));
    setStep("review");
    setLoading(false);
    setParseProgress({ current: 0, total: 0 });
  }

  // Receipt operations (multi-receipt)
  function updateEntryReceipt(entryId: string, field: keyof ParsedReceipt, value: string | number) {
    setReceipts((prev) =>
      prev.map((e) => e.id === entryId ? { ...e, receipt: { ...e.receipt, [field]: value } } : e),
    );
  }

  function updateEntryCategory(entryId: string, categoryId: string) {
    setReceipts((prev) =>
      prev.map((e) => e.id === entryId ? { ...e, categoryId } : e),
    );
  }

  function updateEntryItem(entryId: string, itemId: string, field: keyof ParsedReceiptItem, value: string | number) {
    setReceipts((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, receipt: { ...e.receipt, items: e.receipt.items.map((item) => item.id === itemId ? { ...item, [field]: value } : item) } }
          : e,
      ),
    );
  }

  function deleteEntryItem(entryId: string, itemId: string) {
    setReceipts((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const items = e.receipt.items.filter((i) => i.id !== itemId);
        return { ...e, receipt: { ...e.receipt, items, total: items.reduce((s, i) => s + i.totalPrice, 0) } };
      }),
    );
  }

  function deleteReceipt(entryId: string) {
    setReceipts((prev) => prev.filter((e) => e.id !== entryId));
    if (expandedReceiptId === entryId) setExpandedReceiptId(null);
    setSelected((prev) => { const n = new Set(prev); n.delete(entryId); return n; });
  }

  async function handleImportAll() {
    if (!accountId) {
      toast.error("Please select an account.");
      return;
    }
    setLoading(true);
    let imported = 0;
    try {
      // Import selected receipts
      for (const entry of receipts) {
        if (!selected.has(entry.id) || entry.receipt.items.length === 0) continue;
        const result = await createTransactionFromReceipt(
          entry.receipt,
          accountId,
          settings.currency,
          entry.categoryId || null,
          entry.storedPath || undefined,
        );
        if ("error" in result) {
          toast.error(`${entry.receipt.merchant}: ${result.error}`);
        } else {
          imported++;
        }
      }
      // Import individual transactions
      const toImport = transactions.filter((t) => selected.has(t.id));
      if (toImport.length > 0) {
        const result = await bulkCreateTransactions(toImport, accountId, settings.currency);
        if ("error" in result) {
          toast.error(result.error);
        } else {
          imported += result.count;
        }
      }
      setImportCount(imported);
      setStep("done");
      onSuccess();
    } catch {
      toast.error("Failed to import.");
    } finally {
      setLoading(false);
    }
  }

  // CSV transaction operations
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const allIds = [
      ...receipts.map((r) => r.id),
      ...transactions.map((t) => t.id),
    ];
    setSelected(
      selected.size === allIds.length ? new Set() : new Set(allIds),
    );
  }

  function updateTxField(
    id: string,
    field: keyof ParsedTransaction,
    value: string | number,
  ) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  }

  function deleteTx(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  async function handleImportCSV() {
    const toImport = transactions.filter((t) => selected.has(t.id));
    if (!toImport.length) {
      toast.error("No transactions selected.");
      return;
    }
    if (!accountId) {
      toast.error("Please select an account.");
      return;
    }
    setLoading(true);
    try {
      const result = await bulkCreateTransactions(
        toImport,
        accountId,
        settings.currency,
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setImportCount(result.count);
      setStep("done");
      onSuccess();
    } catch {
      toast.error("Failed to import transactions.");
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const csv = `date,amount,description,type,category\n2026-03-01,-45.50,Grocery Store,expense,Food\n2026-03-02,3000.00,Salary,income,Income`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <ResponsiveDialogContent className="max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {step === "upload" && "Import"}
            {step === "review" && `Review (${receipts.length + transactions.length})`}
            {step === "done" && "Done"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={mode === "csv" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("csv")}
              >
                <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                CSV
              </Button>
              <Button
                variant={mode === "ai" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("ai")}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Receipt (AI)
              </Button>
            </div>

            {mode === "ai" && !settings.aiEnabled && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-950/30">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  AI is not enabled
                </p>
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                  Go to Settings → enable AI and add your OpenAI API key to use this feature.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account</label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={() => !loading && (mode !== "ai" || settings.aiEnabled) && fileRef.current?.click()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {mode === "ai"
                      ? parseProgress.total > 1
                        ? `Parsing file ${parseProgress.current} of ${parseProgress.total}...`
                        : "AI is parsing your receipt..."
                      : "Parsing CSV..."}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {mode === "csv"
                      ? "Upload CSV file"
                      : "Upload receipts / statements"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {mode === "csv" ? ".csv" : "Image, PDF, or any document — select multiple"}
                  </p>
                </>
              )}
              <input
                key={mode}
                ref={fileRef}
                type="file"
                className="hidden"
                multiple={mode === "ai"}
                accept={
                  mode === "csv"
                    ? ".csv,.tsv,.txt,text/csv,text/plain,application/vnd.ms-excel"
                    : "image/*,.pdf,.heic,.webp,.csv,.tsv,.txt,.json"
                }
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) handleFiles(files);
                  e.target.value = "";
                }}
              />
            </div>

            {mode === "csv" && (
              <button
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={downloadTemplate}
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV template
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Review Receipts (+ mixed transactions) ── */}
        {step === "review" && receipts.length > 0 && (
          <div className="space-y-3">
            {/* Select all / deselect */}
            <div className="flex items-center justify-between">
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={toggleAll}
              >
                {selected.size === receipts.length + transactions.length ? "Deselect all" : "Select all"}
              </button>
              <span className="text-xs text-muted-foreground">
                {selected.size} selected
              </span>
            </div>

            <div className="max-h-[55vh] space-y-2 overflow-auto">
              {receipts.map((entry) => {
                const isExpanded = expandedReceiptId === entry.id;
                const isSelected = selected.has(entry.id);
                return (
                  <div key={entry.id} className={`rounded-lg border transition-colors ${isSelected ? "border-primary/40 bg-primary/5" : ""}`}>
                    {/* Collapsed header */}
                    <div className="flex w-full items-center gap-2 p-3">
                      <button
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : ""
                        }`}
                        onClick={() => toggleSelect(entry.id)}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                      <button
                        className="flex flex-1 items-center gap-2 text-left min-w-0"
                        onClick={() => setExpandedReceiptId(isExpanded ? null : entry.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{entry.receipt.merchant}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.receipt.date} · {entry.receipt.items.length} items
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {settings.currency} {entry.receipt.total.toFixed(2)}
                        </p>
                      </button>
                      <button
                        onClick={() => deleteReceipt(entry.id)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="space-y-3 border-t px-3 pb-3 pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Merchant</p>
                          <Input
                            value={entry.receipt.merchant}
                            className="mt-1 h-9 text-sm font-medium"
                            onChange={(e) => updateEntryReceipt(entry.id, "merchant", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <Input
                              type="date"
                              value={entry.receipt.date}
                              className="mt-1 h-9 text-sm"
                              onChange={(e) => updateEntryReceipt(entry.id, "date", e.target.value)}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <Select
                              value={entry.categoryId || "none"}
                              onValueChange={(v) => updateEntryCategory(entry.id, v === "none" ? "" : v)}
                            >
                              <SelectTrigger className="mt-1 h-9 text-sm">
                                <SelectValue placeholder="None" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            {entry.receipt.items.length} Items
                          </p>
                          <div className="space-y-1.5">
                            {entry.receipt.items.map((item) => (
                              <div key={item.id} className="rounded-lg border p-2.5">
                                {editingItemId === item.id ? (
                                  <div className="space-y-1.5">
                                    <Input
                                      value={item.name}
                                      className="h-8 text-sm"
                                      placeholder="Item name"
                                      onChange={(e) => updateEntryItem(entry.id, item.id, "name", e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                      <div className="w-20">
                                        <p className="mb-0.5 text-[10px] text-muted-foreground">Qty</p>
                                        <Input
                                          type="number"
                                          value={item.quantity}
                                          className="h-8 text-sm"
                                          onChange={(e) => updateEntryItem(entry.id, item.id, "quantity", Number(e.target.value))}
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="mb-0.5 text-[10px] text-muted-foreground">Price</p>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={item.totalPrice}
                                          className="h-8 text-sm"
                                          onChange={(e) => updateEntryItem(entry.id, item.id, "totalPrice", Number(e.target.value))}
                                        />
                                      </div>
                                      <button
                                        onClick={() => setEditingItemId(null)}
                                        className="mt-auto mb-1 text-primary hover:text-primary/80"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm leading-snug">{item.name}</p>
                                      {item.quantity > 1 && (
                                        <p className="text-xs text-muted-foreground">
                                          {item.quantity} x {item.unitPrice != null ? item.unitPrice.toFixed(2) : ""}
                                        </p>
                                      )}
                                    </div>
                                    <p className="shrink-0 text-sm font-medium tabular-nums">
                                      {item.totalPrice.toFixed(2)}
                                    </p>
                                    <div className="flex shrink-0 gap-1">
                                      <button
                                        onClick={() => setEditingItemId(item.id)}
                                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteEntryItem(entry.id, item.id)}
                                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Also show transactions if AI detected some as transaction lists */}
              {transactions.length > 0 && transactions.map((tx) => (
              <div
                key={tx.id}
                className={`rounded-lg border p-2.5 transition-colors ${selected.has(tx.id) ? "border-primary/40 bg-primary/5" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <button
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                      selected.has(tx.id) ? "border-primary bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => toggleSelect(tx.id)}
                  >
                    {selected.has(tx.id) && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date} · {tx.type}{tx.category ? ` · ${tx.category}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums">
                    {tx.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => deleteTx(tx.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              ))}
            </div>

            <ResponsiveDialogFooter>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("upload");
                    setReceipts([]);
                    setTransactions([]);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleImportAll}
                  disabled={loading || selected.size === 0}
                >
                  {loading ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="mr-1.5 h-4 w-4" />
                  )}
                  Import {selected.size}
                </Button>
              </div>
            </ResponsiveDialogFooter>
          </div>
        )}

        {/* ── STEP 2: Review Transactions (CSV or AI-detected list) ── */}
        {step === "review" && receipts.length === 0 && transactions.length > 0 && (
          <div className="space-y-3">
            {/* Select all / deselect */}
            <div className="flex items-center justify-between">
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={toggleAll}
              >
                {selected.size === transactions.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
              <span className="text-xs text-muted-foreground">
                {selected.size} selected
              </span>
            </div>

            <div className="max-h-[50vh] space-y-1.5 overflow-auto">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`rounded-lg border p-2.5 transition-colors ${selected.has(tx.id) ? "border-primary/40 bg-primary/5" : ""}`}
                >
                  {editingTxId === tx.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={tx.date}
                          className="h-8 flex-1 text-sm"
                          onChange={(e) =>
                            updateTxField(tx.id, "date", e.target.value)
                          }
                        />
                        <Select
                          value={tx.type}
                          onValueChange={(v) => updateTxField(tx.id, "type", v)}
                        >
                          <SelectTrigger className="h-8 w-28 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={tx.description}
                        className="h-8 text-sm"
                        placeholder="Description"
                        onChange={(e) =>
                          updateTxField(tx.id, "description", e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={tx.amount}
                          className="h-8 flex-1 text-sm"
                          onChange={(e) =>
                            updateTxField(
                              tx.id,
                              "amount",
                              Number(e.target.value),
                            )
                          }
                        />
                        <Select
                          value={tx.category || "none"}
                          onValueChange={(v) => updateTxField(tx.id, "category", v === "none" ? "" : v)}
                        >
                          <SelectTrigger className="h-8 flex-1 text-sm">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => setEditingTxId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                          selected.has(tx.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => toggleSelect(tx.id)}
                      >
                        {selected.has(tx.id) && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {tx.description}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              tx.type === "income"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{tx.date}</span>
                          {tx.category && (
                            <>
                              <span>·</span>
                              <span>{tx.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-medium">
                        {tx.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => setEditingTxId(tx.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTx(tx.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <ResponsiveDialogFooter>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("upload");
                    setTransactions([]);
                    setSelected(new Set());
                    setReceipts([]);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleImportCSV}
                  disabled={loading || selected.size === 0}
                >
                  {loading ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="mr-1.5 h-4 w-4" />
                  )}
                  Import {selected.size}
                </Button>
              </div>
            </ResponsiveDialogFooter>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === "done" && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium">
              {importCount === 1
                ? "Transaction imported"
                : `${importCount} transactions imported`}
            </p>
            <ResponsiveDialogFooter>
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </ResponsiveDialogFooter>
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
