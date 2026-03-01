"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionFilters } from "./transaction-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { MediaViewerDialog } from "./media-viewer-dialog";
import { MergeDialog } from "./merge-dialog";
import { SplitDialog } from "./split-dialog";
import {
  getTransactions,
  getCategories,
  getAccountsList,
  deleteTransactions,
} from "@/actions/transactions";
import { getPersons } from "@/actions/persons";
import type { TransactionWithCategory, PaginatedResult } from "@/lib/types";
import type { Category, Account, Person } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Pencil,
  Image as ImageIcon,
  FileText,
  Merge,
  Plus,
  Trash2,
  Split,
} from "lucide-react";
import { toast } from "sonner";

function SortableHeader({
  field,
  children,
  onSort,
}: {
  field: string;
  children: React.ReactNode;
  onSort: (field: string) => void;
}) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => onSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    </TableHead>
  );
}

const TYPE_COLORS: Record<string, string> = {
  income:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expense: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

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

export function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  });
  const [sortBy, setSortBy] = useState(urlSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(urlSortOrder);
  const [page, setPage] = useState(urlPage);
  const [result, setResult] =
    useState<PaginatedResult<TransactionWithCategory> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTx, setEditTx] = useState<TransactionWithCategory | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMedia, setViewMedia] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showMerge, setShowMerge] = useState(false);
  const [splitTx, setSplitTx] = useState<TransactionWithCategory | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

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
    setLoading(true);
    const data = await getTransactions({
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
      page,
      sortBy,
      sortOrder,
    });
    setResult(data);
    setLoading(false);
  }, [
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
    page,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  useEffect(() => {
    Promise.all([getCategories(), getAccountsList(), getPersons()]).then(([cats, accs, pers]) => {
      setCategories(cats);
      setAccounts(accs);
      setPersons(pers);
    });
  }, []);

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
        `Deleted ${res.count} transaction${res.count > 1 ? "s" : ""}`,
      );
      setSelected((prev) => {
        const next = new Set(prev);
        deleteIds.forEach((id) => next.delete(id));
        return next;
      });
      loadData();
    } else {
      toast.error(res.error);
    }
    setDeleteIds([]);
  };

  const selectedTransactions =
    result?.data.filter((t) => selected.has(t.id)) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            {result ? `${result.total} transactions` : "Loading..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.size >= 1 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteIds([...selected])}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              <span className="sm:inline hidden">Delete</span> {selected.size}
            </Button>
          )}
          {selected.size >= 2 && (
            <Button onClick={() => setShowMerge(true)}>
              <Merge className="mr-1.5 h-4 w-4" />
              <span className="sm:inline hidden">Merge</span> {selected.size}<span className="sm:inline hidden"> Selected</span>
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-1 h-4 w-4" />
            <span className="sm:inline hidden">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

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
          });
          setSortBy("date");
          setSortOrder("desc");
          setPage(1);
        }}
      />

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {loading
          ? [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))
          : result?.data.map((tx) => (
              <div
                key={tx.id}
                className={`rounded-lg border p-3 space-y-2 ${selected.has(tx.id) ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-primary"
                      checked={selected.has(tx.id)}
                      onChange={() => toggleSelect(tx.id)}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {tx.amount != null ? formatCurrency(Number(tx.amount)) : "-"}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${TYPE_COLORS[tx.type] || TYPE_COLORS.other}`}
                        >
                          {tx.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(tx.date)}
                        {tx.time && ` ${tx.time}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditTx(tx)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {tx.amount != null && tx.amount > 0 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Split" onClick={() => setSplitTx(tx)}>
                        <Split className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteIds([tx.id])}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pl-6">
                  {tx.splits && tx.splits.length > 0 ? (
                    <div className="space-y-0.5 w-full">
                      {tx.splits.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: s.categoryColor ?? "#6b7280" }}
                          />
                          <span>{s.categoryName ?? "None"}</span>
                          {s.personName && (
                            <span
                              className="rounded px-1 text-[10px]"
                              style={{ backgroundColor: (s.personColor ?? "#6b7280") + "20", color: s.personColor ?? "#6b7280" }}
                            >
                              {s.personName}
                            </span>
                          )}
                          <span className="text-muted-foreground">({formatCurrency(s.amount)})</span>
                        </div>
                      ))}
                    </div>
                  ) : tx.category ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                      <span>{tx.category.name}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tx.account.color }} />
                    <span>{tx.account.name}</span>
                  </div>
                  {tx.merchant && (
                    <span className="text-muted-foreground truncate">{tx.merchant}</span>
                  )}
                  {tx.tags && tx.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tx.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                          style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {tx.mediaFiles.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-1.5 text-xs"
                      onClick={() => setViewMedia(tx.mediaFiles)}
                    >
                      {tx.mediaFiles.some((f) => /\.(jpg|jpeg|png)$/i.test(f)) ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {tx.mediaFiles.length > 1 && tx.mediaFiles.length}
                    </Button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-primary"
                  checked={
                    !!result &&
                    result.data.length > 0 &&
                    selected.size === result.data.length
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <SortableHeader field="date" onSort={handleSort}>
                Date & Time
              </SortableHeader>
              <SortableHeader field="amount" onSort={handleSort}>
                Amount
              </SortableHeader>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Account</TableHead>
              <SortableHeader field="merchant" onSort={handleSort}>
                Merchant
              </SortableHeader>
              <TableHead className="hidden lg:table-cell">
                Description
              </TableHead>
              <TableHead>Files</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(10)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : result?.data.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className={selected.has(tx.id) ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={selected.has(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex ">{formatDate(tx.date)}</div>
                      {tx.time && (
                        <div className="text-xs text-muted-foreground">
                          {tx.time}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {tx.amount != null
                        ? formatCurrency(Number(tx.amount))
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={TYPE_COLORS[tx.type] || TYPE_COLORS.other}
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.splits && tx.splits.length > 0 ? (
                        <div className="space-y-0.5">
                          {tx.splits.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: s.categoryColor ?? "#6b7280" }}
                              />
                              <span>{s.categoryName ?? "None"}</span>
                              {s.personName && (
                                <span
                                  className="rounded px-1 text-[10px]"
                                  style={{ backgroundColor: (s.personColor ?? "#6b7280") + "20", color: s.personColor ?? "#6b7280" }}
                                >
                                  {s.personName}
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                ({formatCurrency(s.amount)})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : tx.category ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: tx.category.color }}
                          />
                          <span className="text-sm">{tx.category.name}</span>
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tx.tags?.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                            style={{
                              backgroundColor: tag.color + "20",
                              color: tag.color,
                              borderColor: tag.color,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tx.account.color }}
                        />
                        <span className="text-sm">{tx.account.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {tx.merchant}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate lg:table-cell">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      {tx.mediaFiles.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => setViewMedia(tx.mediaFiles)}
                        >
                          {tx.mediaFiles.some((f) =>
                            /\.(jpg|jpeg|png)$/i.test(f),
                          ) ? (
                            <ImageIcon className="h-3.5 w-3.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                          {tx.mediaFiles.length > 1 && tx.mediaFiles.length}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditTx(tx)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {tx.amount != null && tx.amount > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Split transaction"
                            onClick={() => setSplitTx(tx)}
                          >
                            <Split className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteIds([tx.id])}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

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
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= result.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
          onOpenChange={setShowAdd}
          onSuccess={loadData}
        />
      )}

      <MediaViewerDialog
        files={viewMedia}
        open={viewMedia.length > 0}
        onOpenChange={(open) => !open && setViewMedia([])}
      />

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

      <Dialog
        open={deleteIds.length > 0}
        onOpenChange={(open) => !open && setDeleteIds([])}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Transaction{deleteIds.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {deleteIds.length === 1
                ? "this transaction"
                : `${deleteIds.length} transactions`}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIds([])}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
