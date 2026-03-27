"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IncomeSourcesSection } from "@/components/profile/income-sources-section";
import { ReservesSection } from "@/components/profile/reserves-section";
import { getIncomeSources } from "@/actions/income-sources";
import { getReserves } from "@/actions/reserves";
import { FeatureGate } from "@/components/layout/feature-gate";
import { useAsyncMulti } from "@/hooks/use-async-data";

export default function ProfileIncomePage() {
  const { data, loading, refresh } = useAsyncMulti({
    incomeSources: getIncomeSources,
    reserves: getReserves,
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
      </div>
    );
  }

  return (
    <FeatureGate feature="profileIncome">
      <div className="space-y-6">
        <IncomeSourcesSection sources={data?.incomeSources ?? []} onRefresh={refresh} />
        <ReservesSection reserves={data?.reserves ?? []} onRefresh={refresh} />
      </div>
    </FeatureGate>
  );
}
