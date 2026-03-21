"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getChallenges,
  createChallenge,
  getBadges,
  getStreakData,
  checkAndAwardBadges,
} from "@/actions/challenges";
import { CHALLENGE_TEMPLATES, BADGE_DEFINITIONS } from "@/lib/challenges-data";
import type { ChallengeData, BadgeData, StreakData } from "@/actions/challenges";
import { Loader2, Trophy, Lock, Clock, Flame, Target, Shield, Zap, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CHALLENGE_ICONS: Record<string, string> = {
  "no-spend-day": "🚫",
  "no-spend-weekend": "🏖️",
  "save-target": "💰",
  "streak-logging": "📝",
  "under-budget": "📊",
};

function StreakCard({ streak }: { streak: StreakData }) {
  return (
    <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-emerald-500/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl">🔥</span>
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {streak.currentStreak}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold">
              {streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"} logging streak
            </p>
            <p className="text-sm text-muted-foreground">
              Longest: {streak.longestStreak} days
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {streak.totalDaysLogged} total days logged in the last 60 days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCircle({
  badge,
  earned,
  onClick,
}: {
  badge: (typeof BADGE_DEFINITIONS)[number];
  earned: BadgeData | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 min-w-[72px] transition-transform active:scale-95",
      )}
    >
      <div
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center text-2xl border-2 transition-colors",
          earned
            ? "border-emerald-500/50 bg-emerald-500/10"
            : "border-muted bg-muted/50 grayscale opacity-50",
        )}
      >
        {earned ? badge.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium text-center leading-tight max-w-[72px]",
          earned ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {badge.name}
      </span>
    </button>
  );
}

function BadgesSection({
  badges,
  onBadgeClick,
}: {
  badges: BadgeData[];
  onBadgeClick: (badge: (typeof BADGE_DEFINITIONS)[number], earned: BadgeData | null) => void;
}) {
  const badgeMap = new Map(badges.map((b) => [b.type, b]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-500" />
          Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {BADGE_DEFINITIONS.map((def) => {
            const earned = badgeMap.get(def.type) ?? null;
            return (
              <BadgeCircle
                key={def.type}
                badge={def}
                earned={earned}
                onClick={() => onBadgeClick(def, earned)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeCard({ challenge }: { challenge: ChallengeData }) {
  const now = new Date();
  const endDate = new Date(challenge.endDate);
  const startDate = new Date(challenge.startDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const icon = CHALLENGE_ICONS[challenge.type] ?? "🎯";

  const statusColor = {
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  }[challenge.status] ?? "bg-muted text-muted-foreground";

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{challenge.title}</h3>
              <Badge variant="outline" className={cn("text-[10px] shrink-0 capitalize", statusColor)}>
                {challenge.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{challenge.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    challenge.status === "completed"
                      ? "bg-emerald-500"
                      : challenge.status === "failed"
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500",
                  )}
                  style={{ width: `${Math.min(challenge.progress, 100)}%` }}
                />
              </div>
            </div>

            {challenge.status === "active" && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StartChallengeGrid({
  activeChallengeTypes,
  onStart,
  loading,
}: {
  activeChallengeTypes: Set<string>;
  onStart: (type: string) => void;
  loading: string | null;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-500" />
        Start a Challenge
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHALLENGE_TEMPLATES.map((template) => {
          const icon = CHALLENGE_ICONS[template.type] ?? "🎯";
          const isActive = activeChallengeTypes.has(template.type);

          return (
            <Card
              key={template.type}
              className={cn(
                "transition-colors cursor-pointer hover:border-emerald-500/40",
                isActive && "opacity-50 cursor-not-allowed",
              )}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {template.days} {template.days === 1 ? "day" : "days"}
                      </span>
                      <Button
                        size="sm"
                        variant={isActive ? "outline" : "default"}
                        className={cn(
                          "h-7 text-xs",
                          !isActive && "bg-emerald-600 hover:bg-emerald-700 text-white",
                        )}
                        disabled={isActive || loading === template.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStart(template.type);
                        }}
                      >
                        {loading === template.type ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isActive ? (
                          "Active"
                        ) : (
                          "Start"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ChallengesContent() {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, totalDaysLogged: 0 });
  const [loading, setLoading] = useState(true);
  const [startingChallenge, setStartingChallenge] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<{
    badge: (typeof BADGE_DEFINITIONS)[number];
    earned: BadgeData | null;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [challengesData, badgesData, streakData] = await Promise.all([
        getChallenges(),
        getBadges(),
        getStreakData(),
      ]);
      setChallenges(challengesData);
      setBadges(badgesData);
      setStreak(streakData);

      // Check for new badges in the background
      const newBadges = await checkAndAwardBadges();
      if (newBadges.length > 0) {
        setBadges((prev) => [...newBadges, ...prev]);
        for (const badge of newBadges) {
          toast.success(`Badge earned: ${badge.icon} ${badge.name}!`);
        }
      }
    } catch {
      toast.error("Failed to load challenges data");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartChallenge(type: string) {
    setStartingChallenge(type);
    try {
      const result = await createChallenge(type);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Challenge started!");
        const updated = await getChallenges();
        setChallenges(updated);
      }
    } catch {
      toast.error("Failed to start challenge");
    } finally {
      setStartingChallenge(null);
    }
  }

  function handleBadgeClick(badge: (typeof BADGE_DEFINITIONS)[number], earned: BadgeData | null) {
    if (selectedBadge?.badge.type === badge.type) {
      setSelectedBadge(null);
    } else {
      setSelectedBadge({ badge, earned });
    }
  }

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status !== "active");
  const activeChallengeTypes = new Set(activeChallenges.map((c) => c.type));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-24 md:pb-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Trophy className="h-5 w-5 text-emerald-500" />
        Challenges
      </h1>

      {/* Streak Card */}
      <StreakCard streak={streak} />

      {/* Badges */}
      <BadgesSection badges={badges} onBadgeClick={handleBadgeClick} />

      {/* Selected badge detail */}
      {selectedBadge && (
        <Card className="border-emerald-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedBadge.badge.icon}</span>
              <div>
                <h3 className="font-semibold text-sm">{selectedBadge.badge.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedBadge.badge.description}</p>
                {selectedBadge.earned ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Earned on {new Date(selectedBadge.earned.earnedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Not yet earned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Active Challenges
          </h2>
          {activeChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {/* Completed / Failed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-base text-muted-foreground">Recent Challenges</h2>
          {completedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {/* Start Challenge */}
      <StartChallengeGrid
        activeChallengeTypes={activeChallengeTypes}
        onStart={handleStartChallenge}
        loading={startingChallenge}
      />
    </div>
  );
}
