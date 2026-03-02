"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getShoppingLists,
  getShoppingListDetail,
  createShoppingList,
  deleteShoppingList,
  addItemToList,
  removeItemFromList,
  updateItemQuantity,
  analyzeBasket,
  searchItemNames,
} from "@/actions/shopping-basket";
import type {
  ShoppingListData,
  ShoppingListDetail,
  BasketAnalysis,
  SplitStrategy,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingCart,
  Trophy,
  AlertTriangle,
  Store,
  Minus as MinusIcon,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Scissors,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShoppingBasketDialog({ open, onOpenChange }: Props) {
  const [lists, setLists] = useState<ShoppingListData[]>([]);
  const [activeList, setActiveList] = useState<ShoppingListDetail | null>(null);
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [analyzing, startAnalyzing] = useTransition();

  useEffect(() => {
    if (open) {
      loadLists();
      setActiveList(null);
      setAnalysis(null);
    }
  }, [open]);

  async function loadLists() {
    setLoading(true);
    const data = await getShoppingLists();
    setLists(data);
    setLoading(false);
  }

  async function handleCreateList() {
    const name = newListName.trim();
    if (!name) return;
    const result = await createShoppingList(name);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setNewListName("");
    await loadLists();
    const detail = await getShoppingListDetail(result.id);
    if (detail) setActiveList(detail);
  }

  async function handleDeleteList(id: string) {
    await deleteShoppingList(id);
    await loadLists();
  }

  async function openList(id: string) {
    setLoading(true);
    setAnalysis(null);
    const detail = await getShoppingListDetail(id);
    if (detail) setActiveList(detail);
    setLoading(false);
  }

  async function handleAddItem() {
    if (!activeList) return;
    const name = newItemName.trim();
    if (!name) return;
    const qty = parseFloat(newItemQty) || 1;
    const result = await addItemToList(activeList.id, name, qty);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setNewItemName("");
    setNewItemQty("1");
    const detail = await getShoppingListDetail(activeList.id);
    if (detail) setActiveList(detail);
  }

  async function handleRemoveItem(itemId: string) {
    await removeItemFromList(itemId);
    if (activeList) {
      const detail = await getShoppingListDetail(activeList.id);
      if (detail) setActiveList(detail);
    }
  }

  async function handleQuantityChange(itemId: string, delta: number) {
    if (!activeList) return;
    const item = activeList.items.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    await updateItemQuantity(itemId, newQty);
    const detail = await getShoppingListDetail(activeList.id);
    if (detail) setActiveList(detail);
  }

  function handleCompare() {
    if (!activeList) return;
    startAnalyzing(async () => {
      const result = await analyzeBasket(activeList.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAnalysis(result);
    });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {activeList ? (
              <span className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setActiveList(null);
                    setAnalysis(null);
                    loadLists();
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {activeList.name}
              </span>
            ) : (
              "Shopping Baskets"
            )}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {activeList
              ? "Add items and compare store prices"
              : "Create shopping lists and find the cheapest store"}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {!activeList ? (
          <ListsView
            lists={lists}
            loading={loading}
            newListName={newListName}
            onNewListNameChange={setNewListName}
            onCreateList={handleCreateList}
            onDeleteList={handleDeleteList}
            onOpenList={openList}
          />
        ) : (
          <DetailView
            list={activeList}
            analysis={analysis}
            analyzing={analyzing}
            newItemName={newItemName}
            newItemQty={newItemQty}
            onNewItemNameChange={setNewItemName}
            onNewItemQtyChange={setNewItemQty}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onQuantityChange={handleQuantityChange}
            onCompare={handleCompare}
          />
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ---------------------------------------------------------------------------
// Lists View
// ---------------------------------------------------------------------------

function ListsView({
  lists,
  loading,
  newListName,
  onNewListNameChange,
  onCreateList,
  onDeleteList,
  onOpenList,
}: {
  lists: ShoppingListData[];
  loading: boolean;
  newListName: string;
  onNewListNameChange: (v: string) => void;
  onCreateList: () => void;
  onDeleteList: (id: string) => void;
  onOpenList: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="New list name..."
          value={newListName}
          onChange={(e) => onNewListNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCreateList()}
        />
        <Button size="sm" onClick={onCreateList} disabled={!newListName.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No shopping lists yet. Create one above.
        </div>
      ) : (
        <div className="space-y-2">
          {lists.map((list) => (
            <Card
              key={list.id}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => onOpenList(list.id)}
            >
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{list.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {list.itemCount} item{list.itemCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Autocomplete Input
// ---------------------------------------------------------------------------

function AutocompleteInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const [suggestions, setSuggestions] = useState<{ name: string; count: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const results = await searchItemNames(query);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setActiveIndex(-1);
  }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(value), 200);
    return () => clearTimeout(t);
  }, [value, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectSuggestion(name: string) {
    onChange(name);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") onSubmit();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex].name);
      } else {
        setShowSuggestions(false);
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Input
        ref={inputRef}
        placeholder="Item name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-md overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.name}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50 ${
                i === activeIndex ? "bg-muted" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s.name);
              }}
            >
              <span className="truncate">{s.name}</span>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {s.count}x
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail View
// ---------------------------------------------------------------------------

function DetailView({
  list,
  analysis,
  analyzing,
  newItemName,
  newItemQty,
  onNewItemNameChange,
  onNewItemQtyChange,
  onAddItem,
  onRemoveItem,
  onQuantityChange,
  onCompare,
}: {
  list: ShoppingListDetail;
  analysis: BasketAnalysis | null;
  analyzing: boolean;
  newItemName: string;
  newItemQty: string;
  onNewItemNameChange: (v: string) => void;
  onNewItemQtyChange: (v: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onQuantityChange: (id: string, delta: number) => void;
  onCompare: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopyAsText() {
    const lines: string[] = [];
    lines.push(`\u{1F6D2} ${list.name}`);
    lines.push("");
    for (const item of list.items) {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
      lines.push(`\u25A1 ${item.itemName}${qty}`);
    }

    if (analysis?.cheapestMerchant && analysis.cheapestTotal != null) {
      lines.push("");
      lines.push(
        `\u{1F4A1} Best at: ${analysis.cheapestMerchant} (~${formatCurrency(analysis.cheapestTotal)})`,
      );
    }

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="space-y-4">
      {/* Add item with autocomplete */}
      <div className="flex gap-2">
        <AutocompleteInput
          value={newItemName}
          onChange={onNewItemNameChange}
          onSubmit={onAddItem}
        />
        <Input
          type="number"
          min={1}
          step={1}
          className="w-16 text-center"
          value={newItemQty}
          onChange={(e) => onNewItemQtyChange(e.target.value)}
        />
        <Button size="sm" onClick={onAddItem} disabled={!newItemName.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Items list */}
      {list.items.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-sm">
          Start typing to search from your purchase history
        </div>
      ) : (
        <div className="space-y-1">
          {list.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50"
            >
              <span className="flex-1 text-sm truncate">{item.itemName}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onQuantityChange(item.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  <MinusIcon className="h-3 w-3" />
                </Button>
                <span className="text-sm tabular-nums w-6 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onQuantityChange(item.id, 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {list.items.length > 0 && (
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={onCompare}
            disabled={analyzing}
          >
            <Store className="h-4 w-4 mr-2" />
            {analyzing ? "Comparing..." : "Compare Stores"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyAsText}
            title="Copy as text"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Loading skeleton during analysis */}
      {analyzing && (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-lg bg-yellow-500/10 border border-yellow-500/20" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      )}

      {/* Analysis results */}
      {!analyzing && analysis && <AnalysisResults analysis={analysis} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analysis Results
// ---------------------------------------------------------------------------

function AnalysisResults({ analysis }: { analysis: BasketAnalysis }) {
  if (analysis.merchants.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No purchase history found for these items.
          <br />
          Add line items to your transactions to enable price comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Winner banner */}
      {analysis.cheapestMerchant && analysis.cheapestTotal != null && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="py-3 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                Best: {analysis.cheapestMerchant}
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated total
              </div>
            </div>
            <div className="font-bold text-lg tabular-nums">
              {formatCurrency(analysis.cheapestTotal)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split strategy */}
      {analysis.splitStrategy && (
        <SplitStrategyCard strategy={analysis.splitStrategy} />
      )}

      {/* Merchant list */}
      {analysis.merchants.map((merchant, idx) => (
        <MerchantCard
          key={merchant.merchant}
          merchant={merchant}
          rank={idx + 1}
          isCheapest={merchant.merchant === analysis.cheapestMerchant}
          defaultExpanded={idx === 0}
        />
      ))}
    </div>
  );
}

function SplitStrategyCard({ strategy }: { strategy: SplitStrategy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-green-500/40 bg-green-500/5">
      <CardContent className="py-3 space-y-2">
        <button
          className="w-full flex items-center gap-3 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <Scissors className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              Split across {strategy.storeCount} stores
            </div>
            <div className="text-xs text-muted-foreground">
              Save {formatCurrency(strategy.savings)} vs single store
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-bold text-lg tabular-nums">
              {formatCurrency(strategy.splitTotal)}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="space-y-3 pt-1">
            {strategy.assignments.map((assignment) => (
              <div key={assignment.merchant} className="pl-8">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{assignment.merchant}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatCurrency(assignment.storeTotal)}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {assignment.items.map((item) => (
                    <div
                      key={item.itemName}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <span className="truncate">
                        {item.itemName}
                        {item.quantity > 1 ? ` x${item.quantity}` : ""}
                      </span>
                      <span className="tabular-nums shrink-0 ml-2">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {strategy.unavailableItems.length > 0 && (
              <div className="pl-8 text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                No data: {strategy.unavailableItems.join(", ")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MerchantCard({
  merchant,
  rank,
  isCheapest,
  defaultExpanded,
}: {
  merchant: BasketAnalysis["merchants"][number];
  rank: number;
  isCheapest: boolean;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const totalItems = merchant.availableCount + merchant.unavailableCount;

  return (
    <Card className={isCheapest ? "border-primary/30" : ""}>
      <CardContent className="py-3 space-y-2">
        {/* Header */}
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-muted-foreground w-5">
              {rank}.
            </span>
            <span className="font-medium text-sm truncate">
              {merchant.merchant}
            </span>
            <Badge
              variant={merchant.unavailableCount === 0 ? "secondary" : "outline"}
              className="text-[10px] px-1.5 shrink-0"
            >
              {merchant.availableCount}/{totalItems}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="font-bold tabular-nums text-sm">
              {formatCurrency(merchant.availableTotal)}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded items */}
        {expanded && (
          <div className="pl-7 space-y-1 text-sm">
            {merchant.items.map((item) => (
              <div
                key={item.itemName}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.avgPrice === null && (
                    <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
                  )}
                  <span
                    className={`truncate ${item.avgPrice === null ? "text-muted-foreground" : ""}`}
                  >
                    {item.itemName}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-muted-foreground">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                <span className="tabular-nums text-xs shrink-0 ml-2">
                  {item.totalPrice !== null
                    ? formatCurrency(item.totalPrice)
                    : "no data"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
