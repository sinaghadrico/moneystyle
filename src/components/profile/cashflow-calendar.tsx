"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  ShoppingBag,
  CircleDollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CashflowData } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const KIND_CONFIG = {
  income: { color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", icon: ArrowDownCircle, label: "Income", isIncome: true },
  deposit: { color: "bg-teal-500", textColor: "text-teal-600 dark:text-teal-400", icon: CircleDollarSign, label: "Deposit", isIncome: true },
  expense: { color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", icon: ShoppingBag, label: "Expense", isIncome: false },
  bill: { color: "bg-red-500", textColor: "text-red-600 dark:text-red-400", icon: Receipt, label: "Bill", isIncome: false },
  installment: { color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400", icon: ArrowUpCircle, label: "Installment", isIncome: false },
} as const;

function shortAmount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toFixed(0);
}

type Props = {
  data: CashflowData;
  month: string;
  onMonthChange: (month: string) => void;
};

const ALL_KINDS = ["expense", "deposit", "income", "bill", "installment"] as const;
type EventKind = (typeof ALL_KINDS)[number];

export function CashflowCalendar({ data, month, onMonthChange }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeKinds, setActiveKinds] = useState<Set<EventKind>>(new Set(ALL_KINDS));

  const toggleKind = (kind: EventKind) => {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(kind);
      } else {
        next.add(kind);
      }
      return next;
    });
  };

  const [year, mon] = month.split("-").map(Number);
  const firstDayOfWeek = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const monthLabel = new Date(year, mon - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === mon;
  const currentDay = today.getDate();

  const navigateMonth = (delta: number) => {
    const d = new Date(year, mon - 1 + delta, 1);
    onMonthChange(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
    setSelectedDay(null);
  };

  const selectedDayData = selectedDay
    ? data.days.find((d) => d.day === selectedDay)
    : null;

  // Find min projected balance for chart scaling
  const balances = data.days.map((d) => d.projectedBalance);
  const minBalance = Math.min(...balances, 0);
  const maxBalance = Math.max(...balances, 1);
  const range = maxBalance - minBalance || 1;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
            <p className="text-[10px] text-muted-foreground">Income</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.totalIncome, data.primaryCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingDown className="mx-auto mb-1 h-4 w-4 text-red-500" />
            <p className="text-[10px] text-muted-foreground">Expenses</p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(data.totalExpenses, data.primaryCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Wallet className="mx-auto mb-1 h-4 w-4 text-blue-500" />
            <p className="text-[10px] text-muted-foreground">Net</p>
            <p
              className={cn(
                "text-sm font-semibold",
                data.netCashflow >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatCurrency(data.netCashflow, data.primaryCurrency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-3">
          {/* Month Navigation */}
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-semibold">{monthLabel}</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-t border-l border-border/50">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-border/50 h-16" />
            ))}

            {/* Day cells */}
            {data.days.map((dayData) => {
              const hasEvents = dayData.events.length > 0;
              const isToday = isCurrentMonth && dayData.day === currentDay;
              const isSelected = selectedDay === dayData.day;

              // Calculate day totals
              const dayIncome = dayData.events
                .filter((e) => KIND_CONFIG[e.kind].isIncome)
                .reduce((s, e) => s + e.amount, 0);
              const dayExpense = dayData.events
                .filter((e) => !KIND_CONFIG[e.kind].isIncome)
                .reduce((s, e) => s + e.amount, 0);

              return (
                <button
                  key={dayData.day}
                  onClick={() => setSelectedDay(dayData.day)}
                  className={cn(
                    "relative flex flex-col items-start p-1 h-16 border-r border-b border-border/50 transition-colors text-left overflow-hidden",
                    isSelected
                      ? "bg-primary/10"
                      : hasEvents
                        ? "hover:bg-muted/80"
                        : "hover:bg-muted/30",
                  )}
                >
                  {/* Day number */}
                  <span
                    className={cn(
                      "text-[11px] leading-none",
                      isToday && "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center",
                      !isToday && !hasEvents && "text-muted-foreground",
                      !isToday && hasEvents && "font-medium"
                    )}
                  >
                    {dayData.day}
                  </span>

                  {/* Amount summaries */}
                  {dayIncome > 0 && (
                    <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
                      +{shortAmount(dayIncome)}
                    </span>
                  )}
                  {dayExpense > 0 && (
                    <span className="text-[9px] font-medium text-red-600 dark:text-red-400 leading-tight">
                      -{shortAmount(dayExpense)}
                    </span>
                  )}

                  {/* Event dots at bottom */}
                  {hasEvents && (
                    <div className="flex gap-[2px] mt-auto flex-wrap">
                      {dayData.events.slice(0, 5).map((ev, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            KIND_CONFIG[ev.kind].color
                          )}
                        />
                      ))}
                      {dayData.events.length > 5 && (
                        <span className="text-[8px] text-muted-foreground leading-none">
                          +{dayData.events.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Trailing empty cells */}
            {Array.from({
              length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7,
            }).map((_, i) => (
              <div key={`trail-${i}`} className="border-r border-b border-border/50 h-16" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance Chart */}
      <Card>
        <CardContent className="p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Projected Balance
          </h4>
          <div className="flex items-end gap-[1px] h-20">
            {data.days.map((dayData) => {
              const height =
                ((dayData.projectedBalance - minBalance) / range) * 100;
              const isNegative = dayData.projectedBalance < 0;
              const isBarSelected = selectedDay === dayData.day;
              return (
                <button
                  key={dayData.day}
                  onClick={() => setSelectedDay(dayData.day)}
                  className={cn(
                    "flex-1 rounded-t-sm transition-colors min-w-0",
                    isNegative
                      ? "bg-red-400/60 hover:bg-red-400"
                      : "bg-emerald-400/60 hover:bg-emerald-400",
                    isBarSelected && (isNegative ? "bg-red-500" : "bg-emerald-500")
                  )}
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`Day ${dayData.day}: ${formatCurrency(dayData.projectedBalance, data.primaryCurrency)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">1</span>
            <span className="text-[10px] text-muted-foreground">{daysInMonth}</span>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {(["expense", "deposit", "income", "bill", "installment"] as const).map((kind) => (
          <div key={kind} className="flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full", KIND_CONFIG[kind].color)} />
            <span className="text-[10px] text-muted-foreground">{KIND_CONFIG[kind].label}</span>
          </div>
        ))}
      </div>

      {/* Day Detail Dialog/Drawer */}
      <ResponsiveDialog
        open={selectedDay !== null}
        onOpenChange={(open) => { if (!open) setSelectedDay(null); }}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {selectedDayData
                ? new Date(selectedDayData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {selectedDayData && (
                <span
                  className={cn(
                    "font-medium",
                    selectedDayData.projectedBalance >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  Balance: {formatCurrency(selectedDayData.projectedBalance, data.primaryCurrency)}
                </span>
              )}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          {/* Kind filter tags */}
          {selectedDayData && selectedDayData.events.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ALL_KINDS.map((kind) => {
                const config = KIND_CONFIG[kind];
                const isActive = activeKinds.has(kind);
                const count = selectedDayData.events.filter((e) => e.kind === kind).length;
                if (count === 0) return null;
                return (
                  <button
                    key={kind}
                    onClick={() => toggleKind(kind)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border",
                      isActive
                        ? `${config.color} text-white border-transparent`
                        : "bg-muted/50 text-muted-foreground border-border"
                    )}
                  >
                    {config.label}
                    <span className={cn(
                      "text-[10px] rounded-full px-1 min-w-[16px] text-center",
                      isActive ? "bg-white/20" : "bg-muted"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedDayData && selectedDayData.events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No events on this day</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {selectedDayData?.events.filter((ev) => activeKinds.has(ev.kind)).map((ev, i) => {
                const config = KIND_CONFIG[ev.kind];
                const Icon = config.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className={cn("rounded-full p-2", `${config.color}/10`)}>
                      <Icon className={cn("h-4 w-4", config.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ev.name}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap",
                        config.isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {config.isIncome ? "+" : "-"}
                      {formatCurrency(ev.amount, data.primaryCurrency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
