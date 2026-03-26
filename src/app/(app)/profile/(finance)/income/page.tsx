"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IncomeSourcesSection } from "@/components/profile/income-sources-section";
import { ReservesSection } from "@/components/profile/reserves-section";
import { getIncomeSources, getReserves } from "@/actions/profile";
import type { IncomeSourceData, ReserveData } from "@/lib/types";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function ProfileIncomePage() {
  const [loading, setLoading] = useState(true);
  const [incomeSources, setIncomeSources] = useState<IncomeSourceData[]>([]);
  const [reserves, setReserves] = useState<ReserveData[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [sources, res] = await Promise.all([
      getIncomeSources(),
      getReserves(),
    ]);
    setIncomeSources(sources);
    setReserves(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <IncomeSourcesSection sources={incomeSources} onRefresh={loadData} />
        <ReservesSection reserves={reserves} onRefresh={loadData} />
      </div>
    </FeatureGate>
  );
}
