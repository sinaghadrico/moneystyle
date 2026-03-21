"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getHouseholdLeaderboard,
  getWeeklyWinner,
} from "@/actions/leaderboard";
import type { LeaderboardEntry } from "@/actions/leaderboard";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Flame, Target, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

function PodiumAvatar({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const medals = ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"]; // 🥇🥈🥉
  const sizes = ["", "h-16 w-16", "h-12 w-12", "h-12 w-12"];
  const podiumHeights = ["", "h-20", "h-14", "h-10"];
  const order = ["", "order-2", "order-1", "order-3"];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1",
        order[rank],
      )}
    >
      <span className="text-2xl">{medals[rank]}</span>
      <div
        className={cn(
          "relative",
          isCurrentUser && "ring-2 ring-emerald-500 rounded-full",
        )}
      >
        <Avatar className={sizes[rank]}>
          <AvatarImage src={entry.userImage ?? undefined} />
          <AvatarFallback className="text-sm">
            {entry.userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="text-sm font-semibold text-center truncate max-w-[80px]">
        {entry.userName}
      </p>
      <p className="text-xs text-muted-foreground">{entry.score} pts</p>
      <div
        className={cn(
          "w-20 rounded-t-lg bg-gradient-to-t from-emerald-500/30 to-emerald-500/10",
          podiumHeights[rank],
        )}
      />
    </div>
  );
}

export function HouseholdLeaderboard() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id ?? "";
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [weeklyWinner, setWeeklyWinner] = useState<{
    name: string;
    achievement: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    const [leaderboard, winner] = await Promise.all([
      getHouseholdLeaderboard(),
      getWeeklyWinner(),
    ]);
    setEntries(leaderboard);
    setWeeklyWinner(winner);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <Trophy className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Join or create a household to see the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="h-5 w-5 text-emerald-500" />
        Leaderboard
      </h3>

      {/* Weekly Winner Banner */}
      {weeklyWinner && (
        <Card className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="py-3 flex items-center gap-3">
            <span className="text-2xl">{"\uD83C\uDFC6"}</span>
            <p className="text-sm font-medium">
              <span className="font-bold">{weeklyWinner.name}</span>{" "}
              {weeklyWinner.achievement}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Podium */}
      {entries.length >= 2 && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="flex items-end justify-center gap-4">
              {top3.map((entry) => (
                <PodiumAvatar
                  key={entry.userId}
                  entry={entry}
                  rank={entry.rank}
                  isCurrentUser={entry.userId === currentUserId}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center text-xs text-muted-foreground pb-1 border-b">
              <span className="w-6">#</span>
              <span>Member</span>
              <span className="text-right w-16">
                <PiggyBank className="h-3 w-3 inline" />
              </span>
              <span className="text-right w-12">
                <Target className="h-3 w-3 inline" />
              </span>
              <span className="text-right w-10">
                <Flame className="h-3 w-3 inline" />
              </span>
              <span className="text-right w-12">Score</span>
            </div>

            {entries.map((entry) => {
              const isMe = entry.userId === currentUserId;
              return (
                <div
                  key={entry.userId}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center py-2 rounded-md px-1",
                    isMe && "bg-emerald-500/5 border border-emerald-500/20",
                  )}
                >
                  <span className="w-6 text-sm font-medium text-muted-foreground">
                    {entry.rank}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={entry.userImage ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {entry.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">
                      {entry.userName}
                      {isMe && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">
                          (you)
                        </span>
                      )}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-right text-xs font-medium w-16",
                      entry.stats.totalSaved >= 0
                        ? "text-green-600"
                        : "text-red-500",
                    )}
                  >
                    {entry.stats.totalSaved >= 0 ? "+" : ""}
                    {entry.stats.totalSaved.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-right text-xs w-12">
                    {entry.stats.budgetAdherence}%
                  </span>
                  <span className="text-right text-xs w-10">
                    {entry.stats.streak > 0 ? (
                      <>
                        {entry.stats.streak}
                        <span className="ml-0.5">{"\uD83D\uDD25"}</span>
                      </>
                    ) : (
                      "0"
                    )}
                  </span>
                  <span className="text-right text-sm font-bold w-12">
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <PiggyBank className="h-3 w-3" /> Saved
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" /> Budget %
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3" /> Streak
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
