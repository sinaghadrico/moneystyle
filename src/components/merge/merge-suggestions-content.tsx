"use client";

import { useReducer, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaViewerDialog } from "@/components/transactions/media-viewer-dialog";
import {
  getMergeSuggestions,
  mergeTransactions,
  type MergeSuggestion,
} from "@/actions/merge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Check,
  SkipForward,
  Merge,
  Image as ImageIcon,
  FileText,
  PartyPopper,
} from "lucide-react";

// ── Reducer types & function ──

type MergeState = {
  suggestions: MergeSuggestion[];
  currentIndex: number;
  loading: boolean;
  merging: boolean;
  primaryId: string;
  mergedCount: number;
  viewMedia: string[];
};

type MergeAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_SUGGESTIONS"; payload: MergeSuggestion[] }
  | { type: "GO_NEXT" }
  | { type: "SET_MERGING"; payload: boolean }
  | { type: "SET_PRIMARY_ID"; payload: string }
  | { type: "ADD_MERGED_COUNT"; payload: number }
  | { type: "SET_VIEW_MEDIA"; payload: string[] };

const mergeInitialState: MergeState = {
  suggestions: [],
  currentIndex: 0,
  loading: true,
  merging: false,
  primaryId: "",
  mergedCount: 0,
  viewMedia: [],
};

function mergeReducer(state: MergeState, action: MergeAction): MergeState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "LOAD_SUGGESTIONS": {
      const data = action.payload;
      return {
        ...state,
        suggestions: data,
        currentIndex: 0,
        primaryId: data.length > 0 ? data[0].transactions[0].id : "",
        loading: false,
      };
    }
    case "GO_NEXT": {
      const nextIdx = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: nextIdx,
        primaryId: nextIdx < state.suggestions.length
          ? state.suggestions[nextIdx].transactions[0].id
          : state.primaryId,
      };
    }
    case "SET_MERGING":
      return { ...state, merging: action.payload };
    case "SET_PRIMARY_ID":
      return { ...state, primaryId: action.payload };
    case "ADD_MERGED_COUNT":
      return { ...state, mergedCount: state.mergedCount + action.payload };
    case "SET_VIEW_MEDIA":
      return { ...state, viewMedia: action.payload };
    default:
      return state;
  }
}

export function MergeSuggestionsContent() {
  const router = useRouter();
  const [state, dispatch] = useReducer(mergeReducer, mergeInitialState);
  const { suggestions, currentIndex, loading, merging, primaryId, mergedCount, viewMedia } = state;

  const loadSuggestions = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    const data = await getMergeSuggestions();
    dispatch({ type: "LOAD_SUGGESTIONS", payload: data });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSuggestions();
  }, [loadSuggestions]);

  const current = suggestions[currentIndex];
  const remaining = suggestions.length - currentIndex;
  const isDone = !loading && (!current || currentIndex >= suggestions.length);

  const goNext = () => {
    dispatch({ type: "GO_NEXT" });
  };

  const handleMerge = async () => {
    if (!current) return;
    dispatch({ type: "SET_MERGING", payload: true });

    const mergeIds = current.transactions
      .filter((t) => t.id !== primaryId)
      .map((t) => t.id);

    const result = await mergeTransactions(primaryId, mergeIds);
    if (result.error) {
      toast.error("❌ " + result.error);
    } else {
      toast.success(`✅ Merged ${result.mergedCount} duplicate(s)`);
      dispatch({ type: "ADD_MERGED_COUNT", payload: result.mergedCount ?? 0 });
      router.refresh();
      goNext();
    }
    dispatch({ type: "SET_MERGING", payload: false });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PartyPopper className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">All Done!</h2>
        <p className="text-muted-foreground mt-2">
          {mergedCount > 0
            ? `You merged ${mergedCount} duplicate transaction(s) in this session.`
            : "No merge suggestions found. Your transactions look clean!"}
        </p>
        <Button variant="outline" className="mt-6" onClick={loadSuggestions}>
          Check Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Merge Suggestions
          </h2>
          <p className="text-sm text-muted-foreground">
            {remaining} group{remaining !== 1 && "s"} remaining
            {mergedCount > 0 && ` · ${mergedCount} merged`}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1}/{suggestions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${(currentIndex / suggestions.length) * 100}%`,
          }}
        />
      </div>

      {/* Group summary */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{formatDate(current.date)}</span>
        {current.amount != null && (
          <Badge variant="secondary" className="font-bold">
            {formatCurrency(current.amount)}
          </Badge>
        )}
        {current.merchant && (
          <span className="text-muted-foreground">@ {current.merchant}</span>
        )}
        <Badge variant="outline">
          {current.transactions.length} transactions
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Tap to select the primary transaction. The others will be merged into
        it.
      </p>

      {/* Transaction list — flat, no outer card */}
      <div className="space-y-2">
        {current.transactions.map((tx) => {
          const isPrimary = primaryId === tx.id;
          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => dispatch({ type: "SET_PRIMARY_ID", payload: tx.id })}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                isPrimary
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              {/* Row 1: merchant/id + type + primary badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="text-sm font-medium truncate">
                    {tx.description || tx.id.slice(0, 12)}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {tx.type}
                  </Badge>
                  {tx.source && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {tx.source}
                    </Badge>
                  )}
                </div>
                {isPrimary && (
                  <div className="flex items-center gap-1 shrink-0 text-primary">
                    <Check className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Primary</span>
                  </div>
                )}
              </div>

              {/* Row 2: category + time + files */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {tx.categoryName && (
                  <div className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: tx.categoryColor ?? "#6b7280",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {tx.categoryName}
                    </span>
                  </div>
                )}
                {tx.time && (
                  <span className="text-xs text-muted-foreground">
                    {tx.time}
                  </span>
                )}
                {tx.mediaFiles.length > 0 && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "SET_VIEW_MEDIA", payload: tx.mediaFiles });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        dispatch({ type: "SET_VIEW_MEDIA", payload: tx.mediaFiles });
                      }
                    }}
                  >
                    {tx.mediaFiles.some((f) =>
                      /\.(jpg|jpeg|png)$/i.test(f),
                    ) ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    {tx.mediaFiles.length} file(s)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions — 50/50 buttons */}
      <div className="flex w-full gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={goNext}>
          <SkipForward className="mr-1.5 h-4 w-4" />
          Skip
        </Button>
        <Button className="flex-1" onClick={handleMerge} disabled={merging}>
          <Merge className="mr-1.5 h-4 w-4" />
          {merging ? "Merging..." : "Merge"}
        </Button>
      </div>

      <MediaViewerDialog
        files={viewMedia}
        open={viewMedia.length > 0}
        onOpenChange={(open) => !open && dispatch({ type: "SET_VIEW_MEDIA", payload: [] })}
      />
    </div>
  );
}
