"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SavingsGoalsSection } from "@/components/profile/savings-goals-section";
import { getSavingsProgress } from "@/actions/savings";
import type { SavingsProgress } from "@/lib/types";

export default function ProfileGoalsPage() {
  const [loading, setLoading] = useState(true);
  const [savingsGoals, setSavingsGoals] = useState<SavingsProgress[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const sg = await getSavingsProgress(true);
    setSavingsGoals(sg);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <Skeleton className="h-[200px] rounded-xl" />;
  }

  return <SavingsGoalsSection goals={savingsGoals} onRefresh={loadData} />;
}
