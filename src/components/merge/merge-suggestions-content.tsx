"use client";

import { useState, useEffect, useCallback } from "react";
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

export function MergeSuggestionsContent() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<MergeSuggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [primaryId, setPrimaryId] = useState<string>("");
  const [mergedCount, setMergedCount] = useState(0);
  const [viewMedia, setViewMedia] = useState<string[]>([]);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    const data = await getMergeSuggestions();
    setSuggestions(data);
    setCurrentIndex(0);
    if (data.length > 0) {
      setPrimaryId(data[0].transactions[0].id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSuggestions();
  }, [loadSuggestions]);

  const current = suggestions[currentIndex];
  const remaining = suggestions.length - currentIndex;
  const isDone = !loading && (!current || currentIndex >= suggestions.length);

  const goNext = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    if (nextIdx < suggestions.length) {
      setPrimaryId(suggestions[nextIdx].transactions[0].id);
    }
  };

  const handleMerge = async () => {
    if (!current) return;
    setMerging(true);

    const mergeIds = current.transactions
      .filter((t) => t.id !== primaryId)
      .map((t) => t.id);

    const result = await mergeTransactions(primaryId, mergeIds);
    if (result.error) {
      toast.error("❌ " + result.error);
    } else {
      toast.success(`✅ Merged ${result.mergedCount} duplicate(s)`);
      setMergedCount((c) => c + (result.mergedCount ?? 0));
      router.refresh();
      goNext();
    }
    setMerging(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] rounded-xl" />
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
              onClick={() => setPrimaryId(tx.id)}
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
                      setViewMedia(tx.mediaFiles);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        setViewMedia(tx.mediaFiles);
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
        onOpenChange={(open) => !open && setViewMedia([])}
      />
    </div>
  );
}
