"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getItemPriceSummaries,
  getIndividualItemSummaries,
  normalizeItemNamesWithAI,
} from "@/actions/price-analysis";
import type { ItemPriceSummary, PriceAnalysisFilters } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ItemDetailDialog } from "./item-detail-dialog";
import { ItemGroupsDialog } from "./item-groups-dialog";
import { toast } from "sonner";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  ArrowUpDown,
  Store,
  ChevronRight,
  ShoppingCart,
  Package,
} from "lucide-react";

export function PriceAnalysisContent() {
  const [groups, setGroups] = useState<ItemPriceSummary[]>([]);
  const [items, setItems] = useState<ItemPriceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fuzzy, setFuzzy] = useState(false);
  const [sortBy, setSortBy] = useState<PriceAnalysisFilters["sortBy"]>("totalPurchases");
  const [sortOrder, setSortOrder] = useState<PriceAnalysisFilters["sortOrder"]>("desc");

  // Detail dialog
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<"group" | "item">("group");
  const [detailOpen, setDetailOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);

  // AI normalization
  const [aiPending, startAiTransition] = useTransition();

  const opts = { search: search || undefined, fuzzy, sortBy, sortOrder };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [g, i] = await Promise.all([
      getItemPriceSummaries(opts),
      getIndividualItemSummaries(opts),
    ]);
    setGroups(g);
    setItems(i);
    setLoading(false);
  }, [search, fuzzy, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchDebounce), 300);
    return () => clearTimeout(t);
  }, [searchDebounce]);

  function openGroupDetail(normalizedName: string) {
    setDetailKey(normalizedName);
    setDetailMode("group");
    setDetailOpen(true);
  }

  function openItemDetail(normalizedName: string) {
    setDetailKey(normalizedName);
    setDetailMode("item");
    setDetailOpen(true);
  }

  function handleAiNormalize() {
    startAiTransition(async () => {
      const result = await normalizeItemNamesWithAI();
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Created ${result.groupsCreated} groups`);
        loadData();
      }
    });
  }

  // Groups from ItemGroup table (regardless of how many raw names)
  const actualGroups = groups.filter((g) => g.isGroup);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Price Analysis</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setGroupsOpen(true)}>
            <Layers className="h-4 w-4 mr-1" />
            Groups
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiNormalize}
            disabled={aiPending}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {aiPending ? "Normalizing..." : "Normalize with AI"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9"
                value={searchDebounce}
                onChange={(e) => setSearchDebounce(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as PriceAnalysisFilters["sortBy"])}
              >
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalPurchases">Most Purchased</SelectItem>
                  <SelectItem value="avgPrice">Avg Price</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="lastDate">Last Purchased</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch id="fuzzy" checked={fuzzy} onCheckedChange={setFuzzy} />
                <Label htmlFor="fuzzy" className="text-sm whitespace-nowrap">
                  Fuzzy
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Section 1: Groups ── */}
          {actualGroups.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">
                  Groups
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {actualGroups.length}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {actualGroups.map((group) => (
                  <Card
                    key={group.normalizedName}
                    className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => openGroupDetail(group.normalizedName)}
                  >
                    <CardContent className="pt-4 pb-4">
                      {/* Header: name + price */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">
                              {group.displayName}
                            </h3>
                            <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">
                              {group.rawNames.length} items
                            </Badge>
                            <PriceChangeBadge change={group.priceChangePercent} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold tabular-nums text-sm">
                            {formatCurrency(group.avgPrice)}
                          </div>
                          <div className="text-[11px] text-muted-foreground tabular-nums">
                            {formatCurrency(group.minPrice)} – {formatCurrency(group.maxPrice)}
                          </div>
                        </div>
                      </div>

                      {/* Member items */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {group.rawNames.slice(0, 4).map((name) => (
                          <Badge key={name} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                            {name}
                          </Badge>
                        ))}
                        {group.rawNames.length > 4 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                            +{group.rawNames.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {group.totalPurchases}x
                          </span>
                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {group.merchantNames.length} store{group.merchantNames.length !== 1 ? "s" : ""}
                          </span>
                          {group.cheapestMerchant && (
                            <span className="text-green-600 font-medium truncate">
                              Cheapest: {group.cheapestMerchant}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* ── Section 2: All Items ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Items
              </h2>
              <Badge variant="secondary" className="text-xs">
                {items.length}
              </Badge>
            </div>

            {items.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No items found. Add line items to your transactions to see price analysis.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-0 pb-0">
                  {/* Table header — desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_50px_100px_32px] gap-2 px-3 py-2.5 text-xs font-medium text-muted-foreground border-b">
                    <span>Item</span>
                    <span className="text-right">Avg</span>
                    <span className="text-right">Range</span>
                    <span className="text-right">#</span>
                    <span className="text-right">Best At</span>
                    <span />
                  </div>

                  <div className="divide-y">
                    {items.map((item) => (
                      <button
                        key={item.normalizedName}
                        className="w-full text-left hover:bg-muted/50 transition-colors"
                        onClick={() => openItemDetail(item.normalizedName)}
                      >
                        {/* Desktop row */}
                        <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_50px_100px_32px] gap-2 items-center px-3 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-sm truncate">
                              {item.displayName}
                            </span>
                            <PriceChangeBadge change={item.priceChangePercent} />
                          </div>
                          <span className="text-right tabular-nums text-sm">
                            {formatCurrency(item.avgPrice)}
                          </span>
                          <span className="text-right tabular-nums text-xs text-muted-foreground">
                            {formatCurrency(item.minPrice)} – {formatCurrency(item.maxPrice)}
                          </span>
                          <span className="text-right tabular-nums text-sm">
                            {item.totalPurchases}
                          </span>
                          <span className="text-right text-xs text-muted-foreground truncate">
                            {item.cheapestMerchant || "—"}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground justify-self-end" />
                        </div>

                        {/* Mobile row */}
                        <div className="sm:hidden px-3 py-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate flex-1 mr-2">
                              {item.displayName}
                            </span>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(item.avgPrice)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {formatCurrency(item.minPrice)} – {formatCurrency(item.maxPrice)}
                            </span>
                            <span>{item.totalPurchases}x</span>
                            {item.cheapestMerchant && (
                              <span className="truncate">Best: {item.cheapestMerchant}</span>
                            )}
                            <PriceChangeBadge change={item.priceChangePercent} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}

      {/* Dialogs */}
      <ItemDetailDialog
        itemKey={detailKey}
        mode={detailMode}
        fuzzy={fuzzy}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <ItemGroupsDialog
        open={groupsOpen}
        onOpenChange={(open) => {
          setGroupsOpen(open);
          if (!open) loadData();
        }}
      />
    </div>
  );
}

function PriceChangeBadge({ change }: { change: number | null }) {
  if (change === null) return null;

  if (change > 2) {
    return (
      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-0.5">
        <TrendingUp className="h-3 w-3" />
        {change}%
      </Badge>
    );
  }

  if (change < -2) {
    return (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] px-1.5 py-0 gap-0.5">
        <TrendingDown className="h-3 w-3" />
        {change}%
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
      <Minus className="h-3 w-3" />
      {change}%
    </Badge>
  );
}
