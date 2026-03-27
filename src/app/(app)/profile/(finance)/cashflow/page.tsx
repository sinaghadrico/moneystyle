"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CashflowCalendar } from "@/components/profile/cashflow-calendar";
import { getCashflowData } from "@/actions/profile";
import type { CashflowData } from "@/lib/types";
import { FeatureGate } from "@/components/layout/feature-gate";
import { useAsyncData } from "@/hooks/use-async-data";

export default function ProfileCashflowPage() {
  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const { data, loading } = useAsyncData<CashflowData | null>(
    () => getCashflowData(month),
    [month],
    null,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[80px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <FeatureGate feature="profileCashflow">
      <CashflowCalendar data={data} month={month} onMonthChange={setMonth} />
    </FeatureGate>
  );
}
