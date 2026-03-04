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
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-end">
        <div className="col-span-2 space-y-0.5 lg:col-span-1">
          <label className="text-xs text-muted-foreground">Search</label>
          <Input
            placeholder="Search merchant or description..."
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            className="w-full lg:w-[220px]"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-xs text-muted-foreground">From</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange("dateFrom", e.target.value)}
            className="w-full lg:w-[150px]"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-xs text-muted-foreground">To</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange("dateTo", e.target.value)}
            className="w-full lg:w-[150px]"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-xs text-muted-foreground">Account</label>
          <Select
            value={filters.accountId || "all"}
            onValueChange={(v) => onChange("accountId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full lg:w-[170px]">
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
        <div className="space-y-0.5">
          <label className="text-xs text-muted-foreground">Category</label>
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(v) => onChange("categoryId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full lg:w-[150px]">
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
        <div className="space-y-0.5">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select
            value={filters.type || "all"}
            onValueChange={(v) => onChange("type", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full lg:w-[130px]">
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
        <div className="col-span-2 flex items-end gap-2 lg:col-span-1">
          {!showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore((v) => !v)}
            >
              {showMore ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
              More Filters
            </Button>
          )}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-end">
          <div className="col-span-2 space-y-0.5 lg:col-span-1">
            <label className="text-xs text-muted-foreground">Merchant</label>
            <Input
              placeholder="Search merchant..."
              value={filters.merchant}
              onChange={(e) => onChange("merchant", e.target.value)}
              className="w-full lg:w-[180px]"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-muted-foreground">Min Amount</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.amountMin}
              onChange={(e) => onChange("amountMin", e.target.value)}
              className="w-full lg:w-[120px]"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-muted-foreground">Max Amount</label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.amountMax}
              onChange={(e) => onChange("amountMax", e.target.value)}
              className="w-full lg:w-[120px]"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-muted-foreground">Source</label>
            <Select
              value={filters.source || "all"}
              onValueChange={(v) => onChange("source", v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-full lg:w-[140px]">
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
