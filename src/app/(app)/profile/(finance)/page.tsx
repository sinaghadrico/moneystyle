"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialOverviewCard } from "@/components/profile/financial-overview-card";
import { getFinancialOverview } from "@/actions/profile";
import type { FinancialOverview } from "@/lib/types";

export default function ProfileOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FinancialOverview | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const ov = await getFinancialOverview();
    setOverview(ov);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <Skeleton className="h-[200px] rounded-xl" />;
  }

  if (!overview) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  return <FinancialOverviewCard overview={overview} />;
}
