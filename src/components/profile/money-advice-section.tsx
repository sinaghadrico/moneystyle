"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getMoneyAdvice,
  getMoneyAdviceHistory,
  deleteMoneyAdvice,
  type MoneyAdviceResult,
  type MoneyAdviceSuggestion,
  type MoneyAdviceHistoryItem,
} from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  ShieldCheck,
  TrendingUp,
  PiggyBank,
  Lightbulb,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

function shortAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const RISK_CONFIG = {
  low: { label: "Low Risk", color: "text-green-600" },
  medium: { label: "Medium Risk", color: "text-yellow-600" },
  high: { label: "High Risk", color: "text-red-600" },
} as const;

export function MoneyAdviceSection() {
  const [history, setHistory] = useState<MoneyAdviceHistoryItem[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const items = await getMoneyAdviceHistory();
    setHistory(items);
    setViewIndex(0);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    const res = await getMoneyAdvice();
    if ("error" in res) {
      setError(res.error);
    } else {
      await loadHistory();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMoneyAdvice(id);
    toast.success("🗑️ Advice deleted");
    await loadHistory();
  };

  const current = history[viewIndex] ?? null;
  const hasHistory = history.length > 0;

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Money Advice
          </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-1 h-4 w-4" />
              {hasHistory ? "New Analysis" : "Analyze"}
            </>
          )}
        </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered suggestions on how to put your money to work.
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!hasHistory && !loading && !historyLoading && !error && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-amber-400" />
            <p>Get AI-powered suggestions on how to put your money to work.</p>
            <p className="text-xs mt-1">
              Analyzes your reserves, income, and expenses.
            </p>
          </CardContent>
        </Card>
      )}

      {(loading || historyLoading) && !hasHistory && (
        <Card>
          <CardContent className="py-8 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {loading ? "Analyzing your finances..." : "Loading history..."}
            </p>
          </CardContent>
        </Card>
      )}

      {current && (
        <div className="space-y-3">
          {/* History navigation */}
          <div className="flex items-center justify-between">
            {history.length > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                disabled={viewIndex >= history.length - 1}
                onClick={() => setViewIndex((i) => i + 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : <div />}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="h-3 w-3 shrink-0" />
              <span>
                {new Date(current.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {history.length > 1 && (
                <span>
                  ({viewIndex + 1}/{history.length})
                </span>
              )}
            </div>
            {history.length > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                disabled={viewIndex <= 0}
                onClick={() => setViewIndex((i) => i - 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : <div />}
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm">{current.summary}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Emergency
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {shortAmount(current.emergencyFundNeeded)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    have {shortAmount(current.emergencyFundCurrent)}
                  </p>
                </div>
                <div className="rounded-lg border p-2 min-w-0">
                  <TrendingUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Investable</p>
                  <p className="text-sm font-bold tabular-nums">
                    {shortAmount(current.investableAmount)}
                  </p>
                </div>
                <div className="rounded-lg border p-2 min-w-0">
                  <PiggyBank className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Suggestions</p>
                  <p className="text-sm font-bold">
                    {current.suggestions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {current.suggestions.map((s, idx) => (
            <SuggestionCard key={idx} suggestion={s} />
          ))}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              This is not financial advice. Always do your own research.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive"
              onClick={() => handleDelete(current.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function SuggestionCard({ suggestion }: { suggestion: MoneyAdviceSuggestion }) {
  const risk = RISK_CONFIG[suggestion.risk] ?? RISK_CONFIG.medium;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{suggestion.title}</h4>
          <Badge variant="outline" className={`text-xs shrink-0 ${risk.color}`}>
            {risk.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {suggestion.description}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {suggestion.potentialMonthly != null && (
            <span className="text-xs font-medium text-green-600">
              +{formatCurrency(suggestion.potentialMonthly)}/mo
            </span>
          )}
          {suggestion.potentialYearly != null && (
            <span className="text-xs font-medium text-green-600">
              +{formatCurrency(suggestion.potentialYearly)}/yr
            </span>
          )}
          {suggestion.relatedReserve && (
            <span className="text-xs text-muted-foreground">
              from: {suggestion.relatedReserve}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
