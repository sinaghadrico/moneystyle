"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMoodStats } from "@/actions/transactions";
import { SmilePlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MOOD_CONFIG = {
  great: { emoji: "\ud83d\ude04", label: "Great", color: "#22c55e" },
  good: { emoji: "\ud83d\ude42", label: "Good", color: "#10b981" },
  okay: { emoji: "\ud83d\ude10", label: "Okay", color: "#eab308" },
  bad: { emoji: "\ud83d\ude1f", label: "Bad", color: "#f97316" },
  terrible: { emoji: "\ud83d\ude2b", label: "Terrible", color: "#ef4444" },
} as const;

const MOOD_SCORE: Record<string, number> = {
  great: 5,
  good: 4,
  okay: 3,
  bad: 2,
  terrible: 1,
};

function getAverageMoodEmoji(moodCounts: Record<string, number>): string {
  let total = 0;
  let weightedSum = 0;
  for (const [mood, count] of Object.entries(moodCounts)) {
    total += count;
    weightedSum += (MOOD_SCORE[mood] || 3) * count;
  }
  if (total === 0) return "\ud83d\ude10";
  const avg = weightedSum / total;
  if (avg >= 4.5) return "\ud83d\ude04";
  if (avg >= 3.5) return "\ud83d\ude42";
  if (avg >= 2.5) return "\ud83d\ude10";
  if (avg >= 1.5) return "\ud83d\ude1f";
  return "\ud83d\ude2b";
}

function generateInsight(
  spendingByMood: Record<string, number>,
): string | null {
  const stressSpending =
    (spendingByMood.bad || 0) + (spendingByMood.terrible || 0);
  const happySpending =
    (spendingByMood.great || 0) + (spendingByMood.good || 0);

  if (stressSpending === 0 && happySpending === 0) return null;
  if (happySpending === 0 && stressSpending > 0)
    return "Most tracked spending happens when you feel stressed";
  if (stressSpending === 0) return "You mostly spend when feeling good!";

  const ratio = stressSpending / (happySpending || 1);
  if (ratio >= 3) return `You spend ${Math.round(ratio)}x more when stressed`;
  if (ratio >= 1.5)
    return `Stress spending is ${Math.round(ratio)}x your happy spending`;
  if (ratio < 0.5) return "Great job! You spend less when stressed";

  return "Your spending is fairly balanced across moods";
}

export function MoodStatsCard() {
  const [data, setData] = useState<{
    moodCounts: Record<string, number>;
    spendingByMood: Record<string, number>;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getMoodStats();
      setData(result);
    });
  }, []);

  const totalMoods = data
    ? Object.values(data.moodCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <SmilePlus className="h-4 w-4" />
          Money Mood
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending || !data ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : totalMoods === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No mood data yet. Tag your transactions with how they felt!
          </p>
        ) : (
          <>
            {/* Average mood */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {getAverageMoodEmoji(data.moodCounts)}
              </span>
              <div>
                <p className="text-sm font-medium">Average mood this month</p>
                <p className="text-xs text-muted-foreground">
                  {totalMoods} transaction{totalMoods !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>

            {/* Insight */}
            {(() => {
              const insight = generateInsight(data.spendingByMood);
              if (!insight) return null;
              return (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                  {insight}
                </p>
              );
            })()}

            {/* Mini bar chart */}
            <div className="space-y-1.5">
              {(
                Object.keys(MOOD_CONFIG) as Array<keyof typeof MOOD_CONFIG>
              ).map((mood) => {
                const count = data.moodCounts[mood] || 0;
                const pct = totalMoods > 0 ? (count / totalMoods) * 100 : 0;
                const spending = data.spendingByMood[mood] || 0;
                if (count === 0) return null;
                return (
                  <div key={mood} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-center">
                      {MOOD_CONFIG[mood].emoji}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: MOOD_CONFIG[mood].color,
                        }}
                      />
                    </div>
                    <span className="w-7 text-right text-muted-foreground">
                      {count}
                    </span>
                    {spending > 0 && (
                      <span className="w-20 text-right text-muted-foreground">
                        {formatCurrency(spending)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
