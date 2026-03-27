"use client";

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
import { MoodPicker } from "./mood-picker";
import type { TransactionWithCategory, PaginatedResult } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowUpDown,
  Pencil,
  Image as ImageIcon,
  FileText,
  Split,
  List,
  Trash2,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  income:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expense: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

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

export interface TransactionsDesktopTableProps {
  result: PaginatedResult<TransactionWithCategory> | null;
  loading: boolean;
  selected: Set<string>;
  showMood: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSplit: boolean;
  canItems: boolean;
  onSort: (field: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEditTx: (tx: TransactionWithCategory) => void;
  onItemsTx: (tx: TransactionWithCategory) => void;
  onSplitTx: (tx: TransactionWithCategory) => void;
  onDeleteIds: (ids: string[]) => void;
  onViewMedia: (files: string[], txId: string) => void;
}

export function TransactionsDesktopTable({
  result,
  loading,
  selected,
  showMood,
  canEdit,
  canDelete,
  canSplit,
  canItems,
  onSort,
  onToggleSelect,
  onToggleSelectAll,
  onEditTx,
  onItemsTx,
  onSplitTx,
  onDeleteIds,
  onViewMedia,
}: TransactionsDesktopTableProps) {
  return (
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
                onChange={onToggleSelectAll}
              />
            </TableHead>
            <SortableHeader field="date" onSort={onSort}>
              Date & Time
            </SortableHeader>
            <SortableHeader field="amount" onSort={onSort}>
              Amount
            </SortableHeader>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Account</TableHead>
            <SortableHeader field="merchant" onSort={onSort}>
              Merchant
            </SortableHeader>
            <TableHead className="hidden lg:table-cell">
              Description
            </TableHead>
            {showMood && <TableHead>Mood</TableHead>}
            <TableHead>Files</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? [...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(11)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : result?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-40 text-center">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="font-medium">No transactions yet</p>
                    <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
                  </TableCell>
                </TableRow>
              )
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
                      onChange={() => onToggleSelect(tx.id)}
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
                      ? formatCurrency(Number(tx.amount), tx.currency)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className={TYPE_COLORS[tx.type] || TYPE_COLORS.other}
                      >
                        {tx.type}
                      </Badge>
                      {tx.spreadMonths && tx.spreadMonths > 1 && (
                        <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {tx.spreadMonths}mo
                        </Badge>
                      )}
                    </div>
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
                              ({formatCurrency(s.amount, tx.currency)})
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
                  {showMood && (
                  <TableCell>
                    <MoodPicker
                      transactionId={tx.id}
                      currentMood={(tx as Record<string, unknown>).mood as string | undefined}
                    />
                  </TableCell>
                  )}
                  <TableCell>
                    {tx.mediaFiles.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => { onViewMedia(tx.mediaFiles, tx.id); }}
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
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditTx(tx)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      {canItems && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 relative"
                          title="Line items"
                          onClick={() => onItemsTx(tx)}
                        >
                          <List className="h-3 w-3" />
                          {(tx.lineItemCount ?? 0) > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-500 text-[9px] text-white">
                              {tx.lineItemCount}
                            </span>
                          )}
                        </Button>
                      )}
                      {canSplit && tx.amount != null && tx.amount > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Split transaction"
                          onClick={() => onSplitTx(tx)}
                        >
                          <Split className="h-3 w-3" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteIds([tx.id])}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
