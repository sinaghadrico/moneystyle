"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TRANSACTION_TYPES } from "@/lib/constants";
import type { Category, Account } from "@prisma/client";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

type FiltersState = {
  dateFrom: string;
  dateTo: string;
  categoryId: string;
  accountId: string;
  type: string;
  merchant: string;
  search: string;
  amountMin: string;
  amountMax: string;
  source: string;
};

export function TransactionFilters({
  filters,
  categories,
  accounts,
  onChange,
  onReset,
  showAll,
}: {
  filters: FiltersState;
  categories: Category[];
  accounts: Account[];
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  showAll?: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const expanded = showAll || showMore;
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-3">
      {/* Primary filters — single row on desktop */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] lg:gap-2 lg:items-end">
        <div className="col-span-2 grid gap-1 lg:col-span-1">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <Input
            placeholder="Search merchant or description..."
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange("dateFrom", e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange("dateTo", e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Account</Label>
          <Select
            value={filters.accountId || "all"}
            onValueChange={(v) => onChange("accountId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(v) => onChange("categoryId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(v) => onChange("type", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex items-end gap-1 lg:col-span-1">
          {!showAll && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setShowMore((v) => !v)}
              title={showMore ? "Less filters" : "More filters"}
            >
              {showMore ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={onReset}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] lg:gap-2 lg:items-end">
          <div className="col-span-2 grid gap-1 lg:col-span-1">
            <Label className="text-xs text-muted-foreground">Merchant</Label>
            <Input
              placeholder="Search merchant..."
              value={filters.merchant}
              onChange={(e) => onChange("merchant", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Min Amount</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.amountMin}
              onChange={(e) => onChange("amountMin", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Max Amount</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.amountMax}
              onChange={(e) => onChange("amountMax", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Source</Label>
            <Select
              value={filters.source || "all"}
              onValueChange={(v) => onChange("source", v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
