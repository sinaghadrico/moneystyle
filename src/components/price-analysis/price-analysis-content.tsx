"use client";

import { useCallback, useEffect, useReducer, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  deleteItemGroup,
} from "@/actions/price-analysis";
import type { ItemPriceSummary, PriceAnalysisFilters } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { ItemDetailDialog } from "./item-detail-dialog";
import { GroupFormDialog } from "./group-form-dialog";
import { toast } from "sonner";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  ArrowUpDown,
  Store,
  ChevronRight,
  ShoppingCart,
  Package,
  Layers,
} from "lucide-react";
import { useAiCheck, AiSetupDialog } from "@/components/ai-setup-dialog";

// ── Reducer types & function ──

type PriceAnalysisState = {
  groups: ItemPriceSummary[];
  items: ItemPriceSummary[];
  loading: boolean;
  search: string;
  searchDebounce: string;
  fuzzy: boolean;
  sortBy: PriceAnalysisFilters["sortBy"];
  sortOrder: PriceAnalysisFilters["sortOrder"];
  detailKey: string | null;
  detailMode: "group" | "item";
  detailOpen: boolean;
  groupFormOpen: boolean;
  editGroup: { id: string; name: string; rawNames: string[] } | null;
  deleteGroup: { id: string; name: string } | null;
  tab: "groups" | "items";
};

type PriceAnalysisAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DATA"; payload: { groups: ItemPriceSummary[]; items: ItemPriceSummary[] } }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_SEARCH_DEBOUNCE"; payload: string }
  | { type: "SET_FUZZY"; payload: boolean }
  | { type: "SET_SORT_BY"; payload: PriceAnalysisFilters["sortBy"] }
  | { type: "SET_SORT_ORDER"; payload: PriceAnalysisFilters["sortOrder"] }
  | { type: "OPEN_GROUP_DETAIL"; payload: string }
  | { type: "OPEN_ITEM_DETAIL"; payload: string }
  | { type: "SET_DETAIL_OPEN"; payload: boolean }
  | { type: "OPEN_GROUP_FORM"; payload: { id: string; name: string; rawNames: string[] } | null }
  | { type: "SET_GROUP_FORM_OPEN"; payload: boolean }
  | { type: "SET_DELETE_GROUP"; payload: { id: string; name: string } | null }
  | { type: "SET_TAB"; payload: "groups" | "items" };

const initialState: PriceAnalysisState = {
  groups: [],
  items: [],
  loading: true,
  search: "",
  searchDebounce: "",
  fuzzy: false,
  sortBy: "totalPurchases",
  sortOrder: "desc",
  detailKey: null,
  detailMode: "group",
  detailOpen: false,
  groupFormOpen: false,
  editGroup: null,
  deleteGroup: null,
  tab: "groups",
};

function priceAnalysisReducer(state: PriceAnalysisState, action: PriceAnalysisAction): PriceAnalysisState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_DATA":
      return { ...state, groups: action.payload.groups, items: action.payload.items, loading: false };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_SEARCH_DEBOUNCE":
      return { ...state, searchDebounce: action.payload };
    case "SET_FUZZY":
      return { ...state, fuzzy: action.payload };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload };
    case "OPEN_GROUP_DETAIL":
      return { ...state, detailKey: action.payload, detailMode: "group", detailOpen: true };
    case "OPEN_ITEM_DETAIL":
      return { ...state, detailKey: action.payload, detailMode: "item", detailOpen: true };
    case "SET_DETAIL_OPEN":
      return { ...state, detailOpen: action.payload };
    case "OPEN_GROUP_FORM":
      return { ...state, editGroup: action.payload, groupFormOpen: true };
    case "SET_GROUP_FORM_OPEN":
      return { ...state, groupFormOpen: action.payload };
    case "SET_DELETE_GROUP":
      return { ...state, deleteGroup: action.payload };
    case "SET_TAB":
      return { ...state, tab: action.payload };
    default:
      return state;
  }
}

export function PriceAnalysisContent() {
  const [state, dispatch] = useReducer(priceAnalysisReducer, initialState);
  const {
    groups, items, loading, search, searchDebounce, fuzzy, sortBy, sortOrder,
    detailKey, detailMode, detailOpen, groupFormOpen, editGroup, deleteGroup, tab,
  } = state;

  // AI normalization
  const [aiPending, startAiTransition] = useTransition();

  const itemOpts = { search: search || undefined, fuzzy, sortBy, sortOrder };

  const loadData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    const [g, i] = await Promise.all([
      getItemPriceSummaries({}),
      getIndividualItemSummaries(itemOpts),
    ]);
    dispatch({ type: "SET_DATA", payload: { groups: g, items: i } });
  }, [search, fuzzy, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "SET_SEARCH", payload: searchDebounce }), 300);
    return () => clearTimeout(t);
  }, [searchDebounce]);

  function openGroupDetail(normalizedName: string) {
    dispatch({ type: "OPEN_GROUP_DETAIL", payload: normalizedName });
  }

  function openItemDetail(normalizedName: string) {
    dispatch({ type: "OPEN_ITEM_DETAIL", payload: normalizedName });
  }

  const { checkAi, showSetup, setShowSetup } = useAiCheck();

  function handleAiNormalize() {
    if (!checkAi()) return;
    startAiTransition(async () => {
      const result = await normalizeItemNamesWithAI();
      if ("error" in result) {
        toast.error("❌ " + result.error);
      } else {
        toast.success(`✅ Created ${result.groupsCreated} groups`);
        loadData();
      }
    });
  }

  const actualGroups = groups.filter((g) => g.isGroup);

  return (
    <>
    <AiSetupDialog open={showSetup} onOpenChange={setShowSetup} />
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight">Price Analysis</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "groups"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => dispatch({ type: "SET_TAB", payload: "groups" })}
        >
          <Layers className="h-3.5 w-3.5" />
          Groups
          {actualGroups.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-0.5">
              {actualGroups.length}
            </Badge>
          )}
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "items"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => dispatch({ type: "SET_TAB", payload: "items" })}
        >
          <Package className="h-3.5 w-3.5" />
          Items
          {items.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-0.5">
              {items.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Filters — only for Items tab */}
      {tab === "items" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-9"
              value={searchDebounce}
              onChange={(e) => dispatch({ type: "SET_SEARCH_DEBOUNCE", payload: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={sortBy}
              onValueChange={(v) => dispatch({ type: "SET_SORT_BY", payload: v as PriceAnalysisFilters["sortBy"] })}
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
              <Switch id="fuzzy" checked={fuzzy} onCheckedChange={(v) => dispatch({ type: "SET_FUZZY", payload: v })} />
              <Label htmlFor="fuzzy" className="text-sm whitespace-nowrap">
                Fuzzy
              </Label>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : tab === "groups" ? (
        /* ── Groups tab ── */
        <>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => dispatch({ type: "OPEN_GROUP_FORM", payload: null })}>
              <Plus className="h-4 w-4 mr-1" />
              Add Group
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiNormalize}
              disabled={aiPending}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {aiPending ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          {actualGroups.length === 0 ? (
          <div className="py-10 text-center">
            <Layers className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No groups yet. Use &quot;Generate with AI&quot; or add groups manually.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {actualGroups.map((group) => (
              <Card
                key={group.normalizedName}
                className="group/card cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => openGroupDetail(group.normalizedName)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {group.displayName}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">
                        {group.rawNames.length} items
                      </Badge>
                      <PriceChangeBadge change={group.priceChangePercent} />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <div className="font-bold tabular-nums text-sm">
                      {formatCurrency(group.avgPrice)}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {formatCurrency(group.minPrice)} – {formatCurrency(group.maxPrice)}
                    </div>
                  </div>

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
                    <div className="flex items-center gap-0.5 shrink-0">
                      {group.groupId && (
                        <div className="flex gap-0.5 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: "OPEN_GROUP_FORM", payload: { id: group.groupId!, name: group.normalizedName, rawNames: group.rawNames } });
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: "SET_DELETE_GROUP", payload: { id: group.groupId!, name: group.displayName } });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </>
      ) : (
        /* ── Items tab ── */
        items.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No items found. Add line items to your transactions to see price analysis.
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-0 pb-0">
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
        )
      )}

      {/* Dialogs */}
      <ItemDetailDialog
        itemKey={detailKey}
        mode={detailMode}
        fuzzy={fuzzy}
        open={detailOpen}
        onOpenChange={(v) => dispatch({ type: "SET_DETAIL_OPEN", payload: v })}
      />
      <GroupFormDialog
        key={editGroup?.id ?? "new"}
        groupId={editGroup?.id}
        canonicalName={editGroup?.name}
        rawNames={editGroup?.rawNames}
        open={groupFormOpen}
        onOpenChange={(v) => dispatch({ type: "SET_GROUP_FORM_OPEN", payload: v })}
        onSuccess={loadData}
      />
      <DeleteGroupDialog
        group={deleteGroup}
        onOpenChange={(open) => { if (!open) dispatch({ type: "SET_DELETE_GROUP", payload: null }); }}
        onSuccess={loadData}
      />
    </div>
    </>
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

function DeleteGroupDialog({
  group,
  onOpenChange,
  onSuccess,
}: {
  group: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!group) return;
    setDeleting(true);
    const result = await deleteItemGroup(group.id);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Group deleted");
      onOpenChange(false);
      onSuccess();
    }
  }

  return (
    <ResponsiveDialog open={!!group} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete &quot;{group?.name}&quot;?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            This will ungroup the items. Individual items and their price history will not be affected.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
