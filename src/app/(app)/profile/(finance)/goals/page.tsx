"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SavingsGoalsSection } from "@/components/profile/savings-goals-section";
import { getSavingsProgress } from "@/actions/savings";
import type { SavingsProgress } from "@/lib/types";
import { FeatureGate } from "@/components/layout/feature-gate";
import { useAsyncData } from "@/hooks/use-async-data";

export default function ProfileGoalsPage() {
  const { data: savingsGoals, loading, refresh } = useAsyncData(
    () => getSavingsProgress(true),
    [],
  );

  if (loading) {
    return <Skeleton className="h-[200px] rounded-xl" />;
  }

  return (
    <FeatureGate feature="profileGoals">
      <SavingsGoalsSection goals={savingsGoals ?? []} onRefresh={refresh} />
    </FeatureGate>
  );
}
