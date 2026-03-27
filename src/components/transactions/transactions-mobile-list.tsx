"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SwipeableCard } from "./swipeable-card";
import { MoodPicker } from "./mood-picker";
import type { TransactionWithCategory, PaginatedResult } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Pencil,
  Image as ImageIcon,
  FileText,
  Split,
  List,
  Loader2,
  ArrowDown,
  Trash2,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  income:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expense: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export interface TransactionsMobileListProps {
  result: PaginatedResult<TransactionWithCategory> | null;
  loading: boolean;
  page: number;
  selected: Set<string>;
  showMood: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSplit: boolean;
  canItems: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  pullDistance: number;
  refreshing: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onToggleSelect: (id: string) => void;
  onEditTx: (tx: TransactionWithCategory) => void;
  onItemsTx: (tx: TransactionWithCategory) => void;
  onSplitTx: (tx: TransactionWithCategory) => void;
  onDeleteIds: (ids: string[]) => void;
  onViewMedia: (files: string[], txId: string) => void;
}

export function TransactionsMobileList({
  result,
  loading,
  page,
  selected,
  showMood,
  canEdit,
  canDelete,
  canSplit,
  canItems,
  containerRef,
  pullDistance,
  refreshing,
  onTouchStart,
  onTouchEnd,
  onToggleSelect,
  onEditTx,
  onItemsTx,
  onSplitTx,
  onDeleteIds,
  onViewMedia,
}: TransactionsMobileListProps) {
  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="space-y-3 md:hidden"
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: refreshing ? 40 : pullDistance }}
        >
          {refreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <ArrowDown
              className="h-5 w-5 text-muted-foreground transition-transform"
              style={{ transform: `rotate(${pullDistance >= 72 ? 180 : 0}deg)` }}
            />
          )}
        </div>
      )}
      {loading
        ? [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))
        : result?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first transaction to get started</p>
          </div>
        )
        : result?.data.map((tx, txIdx) => (
            <div key={tx.id}>
            <SwipeableCard
              onTap={() => onToggleSelect(tx.id)}
              showHint={txIdx === 0 && page === 1}
              actionWidth={tx.amount != null && tx.amount > 0 ? 280 : 210}
              actions={
                <div className="flex h-full items-stretch">
                  {canEdit && (
                    <button
                      className="flex w-[70px] items-center justify-center bg-blue-500 text-white"
                      onClick={() => onEditTx(tx)}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  )}
                  {canItems && (
                    <button
                      className="flex w-[70px] items-center justify-center bg-violet-500 text-white"
                      onClick={() => onItemsTx(tx)}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  )}
                  {canSplit && tx.amount != null && tx.amount > 0 && (
                    <button
                      className="flex w-[70px] items-center justify-center bg-amber-500 text-white"
                      onClick={() => onSplitTx(tx)}
                    >
                      <Split className="h-5 w-5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="flex w-[70px] items-center justify-center bg-red-500 text-white"
                      onClick={() => onDeleteIds([tx.id])}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              }
            >
              <div
                className={`p-3 space-y-2 ${selected.has(tx.id) ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      selected.has(tx.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selected.has(tx.id) && (
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {tx.amount != null ? formatCurrency(Number(tx.amount), tx.currency) : "-"}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${TYPE_COLORS[tx.type] || TYPE_COLORS.other}`}
                      >
                        {tx.type}
                      </Badge>
                      {tx.spreadMonths && tx.spreadMonths > 1 && (
                        <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {tx.spreadMonths}mo
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(tx.date)}
                      {tx.time && ` ${tx.time}`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pl-7">
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
                          <span className="text-muted-foreground">({formatCurrency(s.amount, tx.currency)})</span>
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
                  {(tx.lineItemCount ?? 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                      <List className="h-3 w-3" />
                      {tx.lineItemCount}
                    </Badge>
                  )}
                  {tx.mediaFiles.length > 0 && (
                    <button
                      className="relative z-10 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground active:bg-muted/80"
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); onViewMedia(tx.mediaFiles, tx.id); }}
                    >
                      {tx.mediaFiles.some((f) => /\.(jpg|jpeg|png)$/i.test(f)) ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {tx.mediaFiles.length > 1 && tx.mediaFiles.length}
                    </button>
                  )}
                </div>
              </div>
            </SwipeableCard>
            {/* Mood Picker — outside SwipeableCard so taps work */}
            {showMood && (
            <div className="pl-10 pb-2 -mt-1">
              <MoodPicker
                transactionId={tx.id}
                currentMood={(tx as Record<string, unknown>).mood as string | undefined}
              />
            </div>
            )}
          </div>
          ))}
    </div>
  );
}
