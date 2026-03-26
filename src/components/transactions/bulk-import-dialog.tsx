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
import { useRouter } from "next/navigation";
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
  MessageCircle,
  ToggleRight,
  Key,
  Settings,
  ExternalLink,
} from "lucide-react";
import JSZip from "jszip";

type Step = "upload" | "review" | "done";
type Mode = "ai" | "csv" | "telegram";
type ReceiptEntry = {
  id: string;
  receipt: ParsedReceipt;
  categoryId: string;
  storedPath: string | null;
};

type TelegramMessage = {
  id: number;
  type: string;
  date: string;
  text: string;
  photo?: string;
  file?: string;
  file_name?: string;
  mime_type?: string;
  text_entities?: { type: string; text: string }[];
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
  const router = useRouter();
  const needsAiSetup = !settings.aiEnabled || !settings.hasOpenaiKey;
  const csvEnabled = settings.isAdmin || settings.featureFlags.importCsv;
  const aiEnabled = settings.isAdmin || settings.featureFlags.importAi;
  const telegramEnabled = settings.isAdmin || settings.featureFlags.importTelegram;
  const availableModes = (["csv", "ai", "telegram"] as Mode[]).filter((m) =>
    m === "csv" ? csvEnabled : m === "ai" ? aiEnabled : telegramEnabled
  );
  const [step, setStep] = useState<Step>("upload");
  const [mode, setMode] = useState<Mode>(availableModes[0] || "csv");
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState(
    settings.defaultAccountId || accounts[0]?.id || "",
  );

  // AI receipt state (multi-file)
  const [receipts, setReceipts] = useState<ReceiptEntry[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(
    null,
  );

  // CSV state
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Progress for multi-file
  const [parseProgress, setParseProgress] = useState({ current: 0, total: 0 });

  const [importCount, setImportCount] = useState(0);
  const [confirmImport, setConfirmImport] = useState(false);
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
    setConfirmImport(false);
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
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        lower.includes(c.name.toLowerCase()),
    );
    return partial ? partial.name : "";
  }

  function matchTransactionCategories(
    txs: ParsedTransaction[],
  ): ParsedTransaction[] {
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

    const res = await fetch("/api/parse-receipt", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (!res.ok || "error" in result)
      return { error: result.error || "Failed to parse" };

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
        errors.push(
          `${fileArray[i].name}: ${e instanceof Error ? e.message : "Failed to process"}`,
        );
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

  async function handleTelegramZip(file: File) {
    setLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);

      // Find result.json (might be in a subfolder, skip __MACOSX)
      let jsonFile: JSZip.JSZipObject | null = null;
      let basePath = "";
      zip.forEach((path, entry) => {
        if (
          path.endsWith("result.json") &&
          !entry.dir &&
          !path.includes("__MACOSX")
        ) {
          jsonFile = entry;
          basePath = path.replace("result.json", "");
        }
      });

      if (!jsonFile) {
        toast.error("result.json not found in zip.");
        setLoading(false);
        return;
      }

      const rawBytes = await (jsonFile as JSZip.JSZipObject).async(
        "uint8array",
      );
      let jsonText = new TextDecoder("utf-8").decode(rawBytes);
      // Strip BOM
      if (jsonText.charCodeAt(0) === 0xfeff) jsonText = jsonText.slice(1);
      const data = JSON.parse(jsonText);
      const messages: TelegramMessage[] = (data.messages || []).filter(
        (m: TelegramMessage) => m.type === "message" && m.text,
      );

      if (messages.length === 0) {
        toast.error("No messages found in export.");
        setLoading(false);
        return;
      }

      // Extract amount from text (supports Persian/Arabic digits)
      function extractAmount(text: string): number {
        // Normalize Persian/Arabic digits to Latin
        const normalized = text
          .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
          .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
        // Match number patterns (with optional decimal)
        const matches = normalized.match(/(\d[\d,]*\.?\d*)/g);
        if (!matches) return 0;
        // Return the largest number found (likely the total)
        let max = 0;
        for (const m of matches) {
          const n = parseFloat(m.replace(/,/g, ""));
          if (n > max) max = n;
        }
        return max;
      }

      // Process messages
      const newReceipts: ReceiptEntry[] = [];
      const newTransactions: ParsedTransaction[] = [];
      const withAttachment = messages.filter((m) => m.photo || m.file);
      const aiCount = settings.aiEnabled ? withAttachment.length : 0;
      setParseProgress({ current: 0, total: messages.length });

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        setParseProgress({ current: i + 1, total: messages.length });
        const msgText =
          typeof msg.text === "string"
            ? msg.text
            : msg.text_entities?.map((e) => e.text).join("") || "";
        const msgDate = msg.date.split("T")[0]; // YYYY-MM-DD
        const attachmentPath = msg.photo || msg.file;

        let aiAmount: number | null = null;
        let storedPath: string | null = null;

        if (attachmentPath && settings.aiEnabled) {
          const fullPath = basePath + attachmentPath;
          const attachmentEntry = zip.file(fullPath);
          if (attachmentEntry) {
            try {
              const blob = await attachmentEntry.async("blob");
              const ext =
                attachmentPath.split(".").pop()?.toLowerCase() || "jpg";
              const attachmentFile = new File(
                [blob],
                attachmentPath.split("/").pop() || `file.${ext}`,
                {
                  type:
                    msg.mime_type ||
                    (ext === "pdf" ? "application/pdf" : `image/${ext}`),
                },
              );
              const formData = new FormData();
              formData.append("file", attachmentFile);
              const res = await fetch("/api/parse-receipt", {
                method: "POST",
                body: formData,
              });
              const result = await res.json();

              if (res.ok && !("error" in result)) {
                storedPath = result.storedPath || null;
                if (result.result.kind === "receipt") {
                  aiAmount = result.result.receipt.total;
                } else if (
                  result.result.kind === "transactions" &&
                  result.result.transactions.length > 0
                ) {
                  aiAmount = result.result.transactions.reduce(
                    (s: number, t: ParsedTransaction) => s + t.amount,
                    0,
                  );
                }
              }
            } catch {
              // AI failed — continue with text extraction
            }
          }
        }

        // Use AI amount if available, otherwise try extracting from text
        const amount = aiAmount ?? extractAmount(msgText);

        newTransactions.push({
          id: `tg-${msg.id}`,
          date: msgDate,
          amount,
          description: msgText,
          type: "expense",
          category: "",
        });
      }

      if (newTransactions.length === 0) {
        toast.error("No transactions found.");
        setLoading(false);
        setParseProgress({ current: 0, total: 0 });
        return;
      }

      const matched = matchTransactionCategories(newTransactions);
      setTransactions(matched);
      setSelected(new Set(matched.map((t) => t.id)));
      setStep("review");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to process Telegram export.",
      );
    }
    setLoading(false);
    setParseProgress({ current: 0, total: 0 });
  }

  // Receipt operations (multi-receipt)
  function updateEntryReceipt(
    entryId: string,
    field: keyof ParsedReceipt,
    value: string | number,
  ) {
    setReceipts((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, receipt: { ...e.receipt, [field]: value } }
          : e,
      ),
    );
  }

  function updateEntryCategory(entryId: string, categoryId: string) {
    setReceipts((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, categoryId } : e)),
    );
  }

  function updateEntryItem(
    entryId: string,
    itemId: string,
    field: keyof ParsedReceiptItem,
    value: string | number,
  ) {
    setReceipts((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              receipt: {
                ...e.receipt,
                items: e.receipt.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item,
                ),
              },
            }
          : e,
      ),
    );
  }

  function deleteEntryItem(entryId: string, itemId: string) {
    setReceipts((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const items = e.receipt.items.filter((i) => i.id !== itemId);
        return {
          ...e,
          receipt: {
            ...e.receipt,
            items,
            total: items.reduce((s, i) => s + i.totalPrice, 0),
          },
        };
      }),
    );
  }

  function deleteReceipt(entryId: string) {
    setReceipts((prev) => prev.filter((e) => e.id !== entryId));
    if (expandedReceiptId === entryId) setExpandedReceiptId(null);
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(entryId);
      return n;
    });
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
        if (!selected.has(entry.id) || entry.receipt.items.length === 0)
          continue;
        const result = await createTransactionFromReceipt(
          entry.receipt,
          accountId,
          settings.currency,
          entry.categoryId || null,
          entry.storedPath || undefined,
          confirmImport,
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
        const result = await bulkCreateTransactions(
          toImport,
          accountId,
          settings.currency,
          confirmImport,
        );
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
    setSelected(selected.size === allIds.length ? new Set() : new Set(allIds));
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
        confirmImport,
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
            {step === "review" &&
              `Review (${receipts.length + transactions.length})`}
            {step === "done" && "Done"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {csvEnabled && (
                <Button
                  variant={mode === "csv" ? "default" : "outline"}
                  className="flex-1"
                  size="sm"
                  onClick={() => setMode("csv")}
                >
                  <FileSpreadsheet className="mr-1 h-4 w-4" />
                  CSV
                </Button>
              )}
              {aiEnabled && (
                <Button
                  variant={mode === "ai" ? "default" : "outline"}
                  className="flex-1"
                  size="sm"
                  onClick={() => setMode("ai")}
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  AI
                </Button>
              )}
              {telegramEnabled && (
                <Button
                  variant={mode === "telegram" ? "default" : "outline"}
                  className="flex-1"
                  size="sm"
                  onClick={() => setMode("telegram")}
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Telegram
                </Button>
              )}
            </div>

            {(mode === "ai" || mode === "telegram") && needsAiSetup && (
              <div className="space-y-3">
                <div className={`flex items-start gap-3 rounded-lg border p-3 ${!settings.aiEnabled ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"}`}>
                  <ToggleRight className={`h-5 w-5 mt-0.5 shrink-0 ${!settings.aiEnabled ? "text-amber-600" : "text-green-600"}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {!settings.aiEnabled ? "1. Enable AI" : "AI is enabled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!settings.aiEnabled
                        ? "Go to Settings → Integrations and turn on the AI toggle."
                        : "Already enabled."}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 rounded-lg border p-3 ${!settings.hasOpenaiKey ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"}`}>
                  <Key className={`h-5 w-5 mt-0.5 shrink-0 ${!settings.hasOpenaiKey ? "text-amber-600" : "text-green-600"}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {!settings.hasOpenaiKey ? "2. Add OpenAI API Key" : "API key configured"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!settings.hasOpenaiKey ? (
                        <>
                          Get your key from{" "}
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline hover:text-foreground">
                            platform.openai.com <ExternalLink className="h-3 w-3" />
                          </a>{" "}
                          and paste it in Settings → Integrations.
                        </>
                      ) : "Already configured."}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/settings/integrations");
                  }}
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Go to Settings
                </Button>
              </div>
            )}

            {!((mode === "ai" || mode === "telegram") && needsAiSetup) && (
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
            )}

            {!((mode === "ai" || mode === "telegram") && needsAiSetup) && (
            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={() =>
                !loading &&
                (mode === "csv" || mode === "telegram" || settings.aiEnabled) &&
                fileRef.current?.click()
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {mode === "telegram"
                      ? parseProgress.total > 0
                        ? `Processing ${parseProgress.current} of ${parseProgress.total} messages...`
                        : "Reading Telegram export..."
                      : mode === "ai"
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
                      : mode === "telegram"
                        ? "Upload Telegram export (.zip)"
                        : "Upload receipts / statements"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {mode === "csv"
                      ? ".csv"
                      : mode === "telegram"
                        ? "Export chat from Telegram Desktop → zip the folder"
                        : "Image, PDF, or any document — select multiple"}
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
                    : mode === "telegram"
                      ? ".zip,application/zip"
                      : "image/*,.pdf,.heic,.webp,.csv,.tsv,.txt,.json"
                }
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  if (mode === "telegram") {
                    handleTelegramZip(files[0]);
                  } else {
                    handleFiles(files);
                  }
                  e.target.value = "";
                }}
              />
            </div>
            )}

            {mode === "csv" && (
              <button
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={downloadTemplate}
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV template
              </button>
            )}

            {mode === "telegram" && !needsAiSetup && (
              <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium">
                  How to export from Telegram:
                </p>
                <ol className="list-inside list-decimal space-y-0.5 text-xs text-muted-foreground">
                  <li>Open Telegram Desktop</li>
                  <li>Open the chat → ⋮ menu → Export chat history</li>
                  <li>Check &quot;Photos&quot; and &quot;Files&quot;</li>
                  <li>Export, then zip the folder and upload here</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Review Receipts (+ mixed transactions) ── */}
        {step === "review" && receipts.length > 0 && (
          <div className="flex flex-col" style={{ maxHeight: "55vh" }}>
            {/* Select all / deselect */}
            <div className="flex items-center justify-between pb-2">
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={toggleAll}
              >
                {selected.size === receipts.length + transactions.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
              <span className="text-xs text-muted-foreground">
                {selected.size} selected
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-auto min-h-0">
              {receipts.map((entry) => {
                const isExpanded = expandedReceiptId === entry.id;
                const isSelected = selected.has(entry.id);
                return (
                  <div
                    key={entry.id}
                    className={`rounded-lg border transition-colors ${isSelected ? "border-primary/40 bg-primary/5" : ""}`}
                  >
                    {/* Collapsed header */}
                    <div className="flex w-full items-center gap-2 p-3">
                      <button
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => toggleSelect(entry.id)}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                      <button
                        className="flex flex-1 items-center gap-2 text-left min-w-0"
                        onClick={() =>
                          setExpandedReceiptId(isExpanded ? null : entry.id)
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {entry.receipt.merchant.replace(/\n+/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.receipt.date} · {entry.receipt.items.length}{" "}
                            items
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
                          <p className="text-xs text-muted-foreground">
                            Merchant
                          </p>
                          <Input
                            value={entry.receipt.merchant}
                            className="mt-1 h-9 text-sm font-medium"
                            onChange={(e) =>
                              updateEntryReceipt(
                                entry.id,
                                "merchant",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Date
                            </p>
                            <Input
                              type="date"
                              value={entry.receipt.date}
                              className="mt-1 h-9 text-sm"
                              onChange={(e) =>
                                updateEntryReceipt(
                                  entry.id,
                                  "date",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Category
                            </p>
                            <Select
                              value={entry.categoryId || "none"}
                              onValueChange={(v) =>
                                updateEntryCategory(
                                  entry.id,
                                  v === "none" ? "" : v,
                                )
                              }
                            >
                              <SelectTrigger className="mt-1 h-9 text-sm">
                                <SelectValue placeholder="None" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
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
                              <div
                                key={item.id}
                                className="rounded-lg border p-2.5"
                              >
                                {editingItemId === item.id ? (
                                  <div className="space-y-1.5">
                                    <Input
                                      value={item.name}
                                      className="h-8 text-sm"
                                      placeholder="Item name"
                                      onChange={(e) =>
                                        updateEntryItem(
                                          entry.id,
                                          item.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <div className="w-20">
                                        <p className="mb-0.5 text-[10px] text-muted-foreground">
                                          Qty
                                        </p>
                                        <Input
                                          type="number"
                                          value={item.quantity}
                                          className="h-8 text-sm"
                                          onChange={(e) =>
                                            updateEntryItem(
                                              entry.id,
                                              item.id,
                                              "quantity",
                                              Number(e.target.value),
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="mb-0.5 text-[10px] text-muted-foreground">
                                          Price
                                        </p>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={item.totalPrice}
                                          className="h-8 text-sm"
                                          onChange={(e) =>
                                            updateEntryItem(
                                              entry.id,
                                              item.id,
                                              "totalPrice",
                                              Number(e.target.value),
                                            )
                                          }
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
                                      <p className="text-sm leading-snug">
                                        {item.name}
                                      </p>
                                      {item.quantity > 1 && (
                                        <p className="text-xs text-muted-foreground">
                                          {item.quantity} x{" "}
                                          {item.unitPrice != null
                                            ? item.unitPrice.toFixed(2)
                                            : ""}
                                        </p>
                                      )}
                                    </div>
                                    <p className="shrink-0 text-sm font-medium tabular-nums">
                                      {item.totalPrice.toFixed(2)}
                                    </p>
                                    <div className="flex shrink-0 gap-1">
                                      <button
                                        onClick={() =>
                                          setEditingItemId(item.id)
                                        }
                                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteEntryItem(entry.id, item.id)
                                        }
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
              {transactions.length > 0 &&
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`rounded-lg border p-2.5 transition-colors ${selected.has(tx.id) ? "border-primary/40 bg-primary/5" : ""}`}
                  >
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
                        <p className="truncate text-sm font-medium">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date} · {tx.type}
                          {tx.category ? ` · ${tx.category}` : ""}
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

            <div className="shrink-0 border-t pt-3 mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmImport}
                  onChange={(e) => setConfirmImport(e.target.checked)}
                  className="rounded"
                />
                Mark as confirmed
              </label>
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
            </div>
          </div>
        )}

        {/* ── STEP 2: Review Transactions (CSV or AI-detected list) ── */}
        {step === "review" &&
          receipts.length === 0 &&
          transactions.length > 0 && (
            <div className="flex flex-col" style={{ maxHeight: "55vh" }}>
              {/* Select all / deselect */}
              <div className="flex items-center justify-between pb-2">
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

              <div className="flex-1 space-y-1.5 overflow-auto min-h-0">
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
                            onValueChange={(v) =>
                              updateTxField(tx.id, "type", v)
                            }
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
                            onValueChange={(v) =>
                              updateTxField(
                                tx.id,
                                "category",
                                v === "none" ? "" : v,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 flex-1 text-sm">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.name}>
                                  {c.name}
                                </SelectItem>
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
                        <div
                          className="flex-1 overflow-hidden cursor-pointer"
                          onClick={() => setEditingTxId(tx.id)}
                        >
                          <p className="truncate text-sm font-medium max-w-[200px]">
                            {tx.description.replace(/\n+/g, " ")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {tx.date}
                            {tx.category ? ` · ${tx.category}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {tx.amount.toFixed(2)}
                        </p>
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

              <div className="shrink-0 border-t pt-3 mt-3 space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmImport}
                    onChange={(e) => setConfirmImport(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  Mark as confirmed
                </label>
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
              </div>
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
            {!confirmImport && (
              <p className="text-sm text-muted-foreground">
                Saved as unconfirmed. Review them in the Unconfirmed tab.
              </p>
            )}
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
