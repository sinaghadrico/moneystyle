"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { InstallmentsSection } from "@/components/profile/installments-section";
import { BillsSection } from "@/components/profile/bills-section";
import { getInstallments, getBills } from "@/actions/profile";
import type { InstallmentData, BillData } from "@/lib/types";

export default function ProfilePaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [installments, setInstallments] = useState<InstallmentData[]>([]);
  const [bills, setBills] = useState<BillData[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [inst, bl] = await Promise.all([
      getInstallments(),
      getBills(),
    ]);
    setInstallments(inst);
    setBills(bl);
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
    <div className="space-y-6">
      <InstallmentsSection installments={installments} onRefresh={loadData} />
      <BillsSection bills={bills} onRefresh={loadData} />
    </div>
  );
}
