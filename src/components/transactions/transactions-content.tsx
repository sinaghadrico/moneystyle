"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "./transaction-filters";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { SlidersHorizontal } from "lucide-react";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { VoiceButton } from "./voice-button";
import { MediaViewerDialog } from "./media-viewer-dialog";
import { MergeDialog } from "./merge-dialog";
import { SplitDialog } from "./split-dialog";
import { ItemsDialog } from "./items-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { TransactionsMobileList } from "./transactions-mobile-list";
import { TransactionsDesktopTable } from "./transactions-desktop-table";
import {
  getTransactions,
  getCategories,
  getAccountsList,
  deleteTransactions,
  confirmTransactions,
  getUnconfirmedCount,
} from "@/actions/transactions";
import { getPersons } from "@/actions/persons";
import type { TransactionWithCategory, PaginatedResult } from "@/lib/types";
import type { Category, Account, Person } from "@prisma/client";
import { useDebounce } from "@/hooks/use-debounce";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useAppSettings } from "@/components/settings/settings-provider";
import {
  ChevronLeft,
  ChevronRight,
  Merge,
  Plus,
  Trash2,
  Loader2,
  X,
  Upload,
  CheckCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

function buildUrl(params: Record<string, string | number>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const s = String(v);
    if (s && s !== "1" && k === "page") sp.set(k, s);
    else if (
      s &&
      !(k === "sortBy" && s === "date") &&
      !(k === "sortOrder" && s === "desc") &&
      k !== "page"
    ) {
      if (s) sp.set(k, s);
    }
  }
  const qs = sp.toString();
  return qs ? `/transactions?${qs}` : "/transactions";
}

export function TransactionsContent({
  initialCategories = [],
  initialAccounts = [],
  initialPersons = [],
}: {
  initialCategories?: Category[];
  initialAccounts?: Account[];
  initialPersons?: Person[];
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings, ready: settingsReady } = useAppSettings();
  const ff = settings.featureFlags;
  const isAdm = settings.isAdmin;
  const importEnabled = isAdm || ff.importCsv || ff.importAi || ff.importTelegram;
  const canAdd = isAdm || ff.txAdd;
  const showMood = isAdm || ff.txMood;
  const canEdit = isAdm || ff.txEdit;
  const canDelete = isAdm || ff.txDelete;
  const canSplit = isAdm || ff.txSplit;
  const canItems = isAdm || ff.txItems;
  const canConfirm = isAdm || ff.txConfirm;

  // Read initial state from URL
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlSortBy = searchParams.get("sortBy") || "date";
  const urlSortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const urlDateFrom = searchParams.get("dateFrom") || "";
  const urlDateTo = searchParams.get("dateTo") || "";
  const urlCategoryId = searchParams.get("categoryId") || "";
  const urlAccountId = searchParams.get("accountId") || "";
  const urlType = searchParams.get("type") || "";
  const urlMerchant = searchParams.get("merchant") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlAmountMin = searchParams.get("amountMin") || "";
  const urlAmountMax = searchParams.get("amountMax") || "";
  const urlSource = searchParams.get("source") || "";

  const [filters, setFilters] = useState({
    dateFrom: urlDateFrom,
    dateTo: urlDateTo,
    categoryId: urlCategoryId,
    accountId: urlAccountId,
    type: urlType,
    merchant: urlMerchant,
    search: urlSearch,
    amountMin: urlAmountMin,
    amountMax: urlAmountMax,
    source: urlSource,
    confirmed: "",
  });
  const [sortBy, setSortBy] = useState(urlSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(urlSortOrder);
  const [page, setPage] = useState(urlPage);
  const [result, setResult] =
    useState<PaginatedResult<TransactionWithCategory> | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [persons, setPersons] = useState<Person[]>(initialPersons);
  const [loading, setLoading] = useState(true);
  const [editTx, setEditTx] = useState<TransactionWithCategory | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [voicePrefill, setVoicePrefill] = useState<import("./add-transaction-dialog").VoicePrefill | null>(null);
  const [viewMedia, setViewMedia] = useState<string[]>([]);
  const [viewMediaTxId, setViewMediaTxId] = useState<string | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const listTopRef = useRef<HTMLDivElement>(null);
  const [showMerge, setShowMerge] = useState(false);
  const [splitTx, setSplitTx] = useState<TransactionWithCategory | null>(null);
  const [itemsTx, setItemsTx] = useState<TransactionWithCategory | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showUnconfirmed, setShowUnconfirmed] = useState(false);
  const [unconfirmedCount, setUnconfirmedCount] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [confirmAllDialog, setConfirmAllDialog] = useState(false);
  const [confirmSelectedDialog, setConfirmSelectedDialog] = useState(false);

  const { containerRef, pullDistance, refreshing, onTouchStart, onTouchEnd } =
    usePullToRefresh(async () => { await loadData(); });

  const debouncedMerchant = useDebounce(filters.merchant, 300);
  const debouncedSearch = useDebounce(filters.search, 300);

  // Sync state to URL
  useEffect(() => {
    const url = buildUrl({
      page,
      sortBy,
      sortOrder,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      categoryId: filters.categoryId,
      accountId: filters.accountId,
      type: filters.type,
      merchant: debouncedMerchant,
      search: debouncedSearch,
      amountMin: filters.amountMin,
      amountMax: filters.amountMax,
      source: filters.source,
    });
    router.replace(url, { scroll: false });
  }, [
    page,
    sortBy,
    sortOrder,
    filters.dateFrom,
    filters.dateTo,
    filters.categoryId,
    filters.accountId,
    filters.type,
    debouncedMerchant,
    debouncedSearch,
    filters.amountMin,
    filters.amountMax,
    filters.source,
    router,
  ]);

  const loadData = useCallback(async () => {
    if (!settingsReady) return;
    setLoading(true);
    try {
      const [data, unconfCount] = await Promise.all([
        getTransactions({
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          categoryId: filters.categoryId || undefined,
          accountId: filters.accountId || undefined,
          type: filters.type || undefined,
          merchant: debouncedMerchant || undefined,
          search: debouncedSearch || undefined,
          amountMin: filters.amountMin ? Number(filters.amountMin) : undefined,
          amountMax: filters.amountMax ? Number(filters.amountMax) : undefined,
          source: filters.source || undefined,
          confirmed: filters.confirmed === "unconfirmed" ? false : true,
          page,
          pageSize: settings.defaultPageSize,
          sortBy,
          sortOrder,
        }),
        getUnconfirmedCount(),
      ]);
      setResult(data);
      setUnconfirmedCount(unconfCount);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setResult({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.categoryId,
    filters.accountId,
    filters.type,
    settings.defaultPageSize,
    debouncedMerchant,
    debouncedSearch,
    filters.amountMin,
    filters.amountMax,
    filters.source,
    filters.confirmed,
    page,
    sortBy,
    sortOrder,
    settingsReady,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadLookups = useCallback(async () => {
    const [cats, accs, pers] = await Promise.all([
      getCategories().catch(() => null),
      getAccountsList().catch(() => null),
      getPersons().catch(() => null),
    ]);
    if (cats) setCategories(cats);
    if (accs) setAccounts(accs);
    if (pers) setPersons(pers);
  }, []);

  useEffect(() => {
    // Only fetch client-side if server didn't provide data
    if (initialCategories.length === 0 && initialAccounts.length === 0) {
      loadLookups();
    }
  }, [loadLookups, initialCategories.length, initialAccounts.length]);

  // Deep-link: ?tx=<id> opens the edit dialog for that transaction
  const txParam = searchParams.get("tx");
  const txParamHandled = useRef(false);
  useEffect(() => {
    if (txParam && result?.data && !txParamHandled.current) {
      const found = result.data.find((t) => t.id === txParam);
      if (found) {
        setEditTx(found);
        txParamHandled.current = true;
      }
    }
  }, [txParam, result]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === "confirmed") {
      setShowUnconfirmed(value === "unconfirmed");
      setSelected(new Set());
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!result) return;
    if (selected.size === result.data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(result.data.map((t) => t.id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteIds.length) return;
    setDeleting(true);
    const res = await deleteTransactions(deleteIds);
    setDeleting(false);
    if ("success" in res) {
      toast.success(
        `🗑️ Deleted ${res.count} transaction${res.count > 1 ? "s" : ""}`,
      );
      setSelected((prev) => {
        const next = new Set(prev);
        deleteIds.forEach((id) => next.delete(id));
        return next;
      });
      loadData();
    } else {
      toast.error(`❌ ${res.error}`);
    }
    setDeleteIds([]);
  };

  const handleConfirm = async (ids: string[]) => {
    if (!ids.length) return;
    setConfirming(true);
    const res = await confirmTransactions(ids);
    setConfirming(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(`Confirmed ${res.count} transaction${res.count > 1 ? "s" : ""}`);
      setSelected(new Set());
      loadData();
    }
  };

  const selectedTransactions =
    result?.data.filter((t) => selected.has(t.id)) ?? [];

  return (
    <div className="space-y-4">
      <div ref={listTopRef} className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">💳 Transactions</h2>
          <p className="text-muted-foreground">
            {result ? `${result.total} transactions` : "Loading..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Mobile: filter button */}
          {(() => {
            const activeFilterCount = Object.entries(filters).filter(
              ([, v]) => v !== "",
            ).length + (showUnconfirmed ? 1 : 0);
            return (
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setFilterDrawerOpen(true)}
              >
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 px-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            );
          })()}
          {/* Desktop: action buttons */}
          {canDelete && selected.size >= 1 && (
            <Button
              variant="destructive"
              className="hidden sm:flex"
              onClick={() => setDeleteIds([...selected])}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete {selected.size}
            </Button>
          )}
          {(isAdm || ff.transactionMerge) && selected.size >= 2 && (
            <Button className="hidden sm:flex" onClick={() => setShowMerge(true)}>
              <Merge className="mr-1.5 h-4 w-4" />
              Merge {selected.size} Selected
            </Button>
          )}
          {canConfirm && showUnconfirmed && selected.size > 0 && (
            <Button
              className="hidden sm:flex"
              onClick={() => setConfirmSelectedDialog(true)}
              disabled={confirming}
            >
              {confirming ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-1 h-4 w-4" />
              )}
              Confirm {selected.size}
            </Button>
          )}
          {importEnabled && (
            <Button variant="outline" className="hidden sm:flex" onClick={() => setShowImport(true)}>
              <Upload className="mr-1 h-4 w-4" />
              Import
            </Button>
          )}
          {canAdd && (
            <>
              <div className="hidden sm:block">
                <VoiceButton onParsed={(data) => { setVoicePrefill(data); setShowAdd(true); }} />
              </div>
              <Button className="hidden sm:flex" onClick={() => setShowAdd(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add Transaction
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Unconfirmed banner */}
      {unconfirmedCount > 0 && !showUnconfirmed && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-800 dark:text-amber-200">
              {unconfirmedCount} unconfirmed transaction{unconfirmedCount > 1 ? "s" : ""} to review
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            onClick={() => {
              setShowUnconfirmed(true);
              setFilters((f) => ({ ...f, confirmed: "unconfirmed" }));
              setPage(1);
              setSelected(new Set());
            }}
          >
            Review
          </Button>
        </div>
      )}
      {showUnconfirmed && (
        <div className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 dark:border-blue-800 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <Clock className="h-4 w-4 shrink-0" />
            Showing unconfirmed transactions
          </div>
          <div className="flex items-center gap-2">
            {canConfirm && result && result.data.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                onClick={() => setConfirmAllDialog(true)}
                disabled={confirming}
              >
                {confirming ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="mr-1 h-3.5 w-3.5" />}
                Confirm All
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowUnconfirmed(false);
                setFilters((f) => ({ ...f, confirmed: "" }));
                setPage(1);
                setSelected(new Set());
              }}
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Mobile: filter drawer */}
      {(() => {
        return (
          <div className="md:hidden">
            <Drawer open={filterDrawerOpen} onOpenChange={(open) => {
              setFilterDrawerOpen(open);
              if (open && (categories.length === 0 || accounts.length === 0)) {
                loadLookups();
              }
            }}>
              <DrawerContent className="max-h-[60vh]">
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto px-4 pb-2">
                  <TransactionFilters
                    showAll
                    filters={filters}
                    categories={categories}
                    accounts={accounts}
                    onChange={handleFilterChange}
                    onReset={() => {
                      setFilters({
                        dateFrom: "",
                        dateTo: "",
                        categoryId: "",
                        accountId: "",
                        type: "",
                        merchant: "",
                        search: "",
                        amountMin: "",
                        amountMax: "",
                        source: "",
                        confirmed: "",
                      });
                      setShowUnconfirmed(false);
                      setSortBy("date");
                      setSortOrder("desc");
                      setPage(1);
                    }}
                  />
                </div>
                <div className="border-t p-3 flex gap-2">
                  {Object.values(filters).some((v) => v !== "") && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setFilters({
                          dateFrom: "",
                          dateTo: "",
                          categoryId: "",
                          accountId: "",
                          type: "",
                          merchant: "",
                          search: "",
                          amountMin: "",
                          amountMax: "",
                          source: "",
                          confirmed: "",
                        });
                        setShowUnconfirmed(false);
                        setSortBy("date");
                        setSortOrder("desc");
                        setPage(1);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  <DrawerClose asChild>
                    <Button className="flex-1">Apply</Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        );
      })()}

      {/* Desktop: inline filters */}
      <div className="hidden md:block">
        <TransactionFilters
          filters={filters}
          categories={categories}
          accounts={accounts}
          onChange={handleFilterChange}
          onReset={() => {
            setFilters({
              dateFrom: "",
              dateTo: "",
              categoryId: "",
              accountId: "",
              type: "",
              merchant: "",
              search: "",
              amountMin: "",
              amountMax: "",
              source: "",
              confirmed: "",
            });
            setShowUnconfirmed(false);
            setSortBy("date");
            setSortOrder("desc");
            setPage(1);
          }}
        />
      </div>

      {/* Mobile card view with pull-to-refresh */}
      <TransactionsMobileList
        result={result}
        loading={loading}
        page={page}
        selected={selected}
        showMood={showMood}
        canEdit={canEdit}
        canDelete={canDelete}
        canSplit={canSplit}
        canItems={canItems}
        containerRef={containerRef}
        pullDistance={pullDistance}
        refreshing={refreshing}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onToggleSelect={toggleSelect}
        onEditTx={setEditTx}
        onItemsTx={setItemsTx}
        onSplitTx={setSplitTx}
        onDeleteIds={setDeleteIds}
        onViewMedia={(files, txId) => { setViewMedia(files); setViewMediaTxId(txId); }}
      />

      {/* Desktop table view */}
      <TransactionsDesktopTable
        result={result}
        loading={loading}
        selected={selected}
        showMood={showMood}
        canEdit={canEdit}
        canDelete={canDelete}
        canSplit={canSplit}
        canItems={canItems}
        onSort={handleSort}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onEditTx={setEditTx}
        onItemsTx={setItemsTx}
        onSplitTx={setSplitTx}
        onDeleteIds={setDeleteIds}
        onViewMedia={(files, txId) => { setViewMedia(files); setViewMediaTxId(txId); }}
      />

      {result && result.totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {result.page} of {result.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => { setPage((p) => p - 1); setTimeout(() => listTopRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= result.totalPages}
              onClick={() => { setPage((p) => p + 1); setTimeout(() => listTopRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile bottom spacer for FAB/tab bar */}
      <div className="h-44 md:hidden" />

      {/* Mobile selection bar + FAB — hide when any dialog/drawer is open */}
      {(() => {
        const anyOpen = showAdd || showImport || !!deleteIds.length || showMerge || filterDrawerOpen || !!editTx || !!splitTx || !!itemsTx || viewMedia.length > 0 || confirmAllDialog || confirmSelectedDialog;
        if (anyOpen) return null;
        const showFab = canAdd || importEnabled;
        if (selected.size === 0) return showFab ? (
          <div className="fixed right-4 z-[51] flex flex-col items-end gap-2 md:hidden" style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom) + 16px + 3rem + 8px)" }}>
            {fabOpen && (
              <>
                <button
                  className="fixed inset-0 z-[-1]"
                  onClick={() => setFabOpen(false)}
                />
                {importEnabled && (
                  <button
                    className="flex items-center gap-2 rounded-full bg-background pl-3 pr-4 py-2 shadow-lg border active:scale-95"
                    onClick={() => { setFabOpen(false); setShowImport(true); }}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">Import</span>
                  </button>
                )}
                {canAdd && (
                  <>
                    <div onClick={() => setFabOpen(false)}>
                      <VoiceButton onParsed={(data) => { setVoicePrefill(data); setShowAdd(true); }} />
                    </div>
                    <button
                      className="flex items-center gap-2 rounded-full bg-background pl-3 pr-4 py-2 shadow-lg border active:scale-95"
                      onClick={() => { setFabOpen(false); setShowAdd(true); }}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Add Transaction</span>
                    </button>
                  </>
                )}
              </>
            )}
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
              onClick={() => setFabOpen((v) => !v)}
              style={{ transform: fabOpen ? "rotate(45deg)" : undefined }}
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        ) : null;
        return (
        <div className="fixed left-3 right-3 z-[55] flex flex-col items-end gap-2 md:hidden" style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom) + 8px)" }}>
          {fabOpen && (
            <>
              <button
                className="fixed inset-0 z-[-1] bg-black/20"
                onClick={() => setFabOpen(false)}
              />
              {importEnabled && (
                <button
                  className="flex items-center gap-2 rounded-full bg-background pl-3 pr-4 py-2.5 shadow-lg border active:scale-95"
                  onClick={() => { setFabOpen(false); setShowImport(true); }}
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">Import</span>
                </button>
              )}
              {canAdd && (
                <button
                  className="flex items-center gap-2 rounded-full bg-background pl-3 pr-4 py-2.5 shadow-lg border active:scale-95"
                  onClick={() => { setFabOpen(false); setShowAdd(true); }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Transaction</span>
                </button>
              )}
            </>
          )}
          {!fabOpen && (
            <button
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
              onClick={() => setFabOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
          <div className="relative flex w-full items-center rounded-lg bg-primary px-3 py-2.5 shadow-xl">
            <span className="absolute -top-5 left-3 rounded-t-lg rounded-b-none bg-primary text-primary-foreground text-[11px] font-semibold px-3 pt-1.5 pb-2 leading-none">{selected.size} items selected</span>
            <div className="flex flex-1 items-center gap-1.5">
              {canConfirm && showUnconfirmed && (
                <button
                  className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-sm font-medium text-white active:scale-95"
                  onClick={() => setConfirmSelectedDialog(true)}
                  disabled={confirming}
                >
                  <CheckCheck className="h-4 w-4" />
                  Confirm
                </button>
              )}
              {(isAdm || ff.transactionMerge) && selected.size >= 2 && (
                <button
                  className="flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1.5 text-sm font-medium text-primary-foreground active:scale-95"
                  onClick={() => setShowMerge(true)}
                >
                  <Merge className="h-4 w-4" />
                  Merge
                </button>
              )}
              {canDelete && (
                <button
                  className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-sm font-medium text-white active:scale-95"
                  onClick={() => setDeleteIds([...selected])}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
            <button
              className="flex shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 p-1.5 text-primary-foreground active:scale-95 ml-1.5"
              onClick={() => setSelected(new Set())}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        );
      })()}

      {editTx && (
        <EditTransactionDialog
          transaction={editTx}
          categories={categories}
          accounts={accounts}
          open={!!editTx}
          onOpenChange={(open) => !open && setEditTx(null)}
          onSuccess={loadData}
        />
      )}

      {showAdd && (
        <AddTransactionDialog
          categories={categories}
          accounts={accounts}
          open={showAdd}
          onOpenChange={(v) => { setShowAdd(v); if (!v) setVoicePrefill(null); }}
          onSuccess={() => { loadData(); setVoicePrefill(null); }}
          prefill={voicePrefill}
        />
      )}

      {showImport && (
        <BulkImportDialog
          accounts={accounts}
          categories={categories}
          open={showImport}
          onOpenChange={setShowImport}
          onSuccess={loadData}
        />
      )}

      <MediaViewerDialog
        files={viewMedia}
        transactionId={viewMediaTxId}
        open={viewMedia.length > 0}
        onOpenChange={(open) => { if (!open) { setViewMedia([]); setViewMediaTxId(undefined); } }}
        onFileDeleted={loadData}
      />

      {itemsTx && (
        <ItemsDialog
          transaction={itemsTx}
          open={!!itemsTx}
          onOpenChange={(open) => !open && setItemsTx(null)}
          onSaved={loadData}
        />
      )}

      {splitTx && (
        <SplitDialog
          transaction={splitTx}
          categories={categories}
          persons={persons}
          open={!!splitTx}
          onOpenChange={(open) => !open && setSplitTx(null)}
          onSuccess={loadData}
        />
      )}

      {showMerge && selectedTransactions.length >= 2 && (
        <MergeDialog
          transactions={selectedTransactions}
          open={showMerge}
          onOpenChange={(open) => {
            if (!open) setShowMerge(false);
          }}
          onSuccess={() => {
            setShowMerge(false);
            setSelected(new Set());
            router.refresh();
            loadData();
          }}
        />
      )}

      <ResponsiveDialog
        open={deleteIds.length > 0}
        onOpenChange={(open) => !open && setDeleteIds([])}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              Delete Transaction{deleteIds.length > 1 ? "s" : ""}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Are you sure you want to delete{" "}
              {deleteIds.length === 1
                ? "this transaction"
                : `${deleteIds.length} transactions`}
              ? This action cannot be undone.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteIds([])}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Confirm all dialog */}
      <ResponsiveDialog
        open={confirmAllDialog}
        onOpenChange={setConfirmAllDialog}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Confirm All Transactions</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Are you sure you want to confirm all {result?.total ?? 0} unconfirmed transactions? They will appear in your reports and charts.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAllDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={confirming}
                onClick={async () => {
                  if (!result) return;
                  setConfirmAllDialog(false);
                  await handleConfirm(result.data.map((t) => t.id));
                }}
              >
                {confirming ? "Confirming..." : "Confirm All"}
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Confirm selected dialog */}
      <ResponsiveDialog
        open={confirmSelectedDialog}
        onOpenChange={setConfirmSelectedDialog}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Confirm Transactions</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Are you sure you want to confirm {selected.size} selected transaction{selected.size > 1 ? "s" : ""}? They will appear in your reports and charts.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmSelectedDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={confirming}
                onClick={async () => {
                  setConfirmSelectedDialog(false);
                  await handleConfirm([...selected]);
                }}
              >
                {confirming ? "Confirming..." : `Confirm ${selected.size}`}
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
