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
import { X } from "lucide-react";

type FiltersState = {
  dateFrom: string;
  dateTo: string;
  categoryId: string;
  accountId: string;
  type: string;
  merchant: string;
};

export function TransactionFilters({
  filters,
  categories,
  accounts,
  onChange,
  onReset,
}: {
  filters: FiltersState;
  categories: Category[];
  accounts: Account[];
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}) {
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1 space-x-2">
        <label className="text-xs text-muted-foreground">From</label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange("dateFrom", e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1 space-x-2">
        <label className="text-xs text-muted-foreground">To</label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange("dateTo", e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1 space-x-2">
        <label className="text-xs text-muted-foreground">Account</label>
        <Select
          value={filters.accountId || "all"}
          onValueChange={(v) => onChange("accountId", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[170px]">
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
      <div className="space-y-1 space-x-2">
        <label className="text-xs text-muted-foreground">Category</label>
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(v) => onChange("categoryId", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[150px]">
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
      <div className="space-y-1 space-x-2">
        <label className="text-xs text-muted-foreground">Type</label>
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => onChange("type", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[130px]">
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
      <div className="space-y-1 space-x-2">
        <label className="text-xs text-muted-foreground">Merchant</label>
        <Input
          placeholder="Search merchant..."
          value={filters.merchant}
          onChange={(e) => onChange("merchant", e.target.value)}
          className="w-[180px]"
        />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
