"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { InstallmentsSection } from "@/components/profile/installments-section";
import { BillsSection } from "@/components/profile/bills-section";
import { getInstallments } from "@/actions/installments";
import { getBills } from "@/actions/bills";
import { FeatureGate } from "@/components/layout/feature-gate";
import { useAsyncMulti } from "@/hooks/use-async-data";

export default function ProfilePaymentsPage() {
  const { data, loading, refresh } = useAsyncMulti({
    installments: getInstallments,
    bills: getBills,
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
    <FeatureGate feature="profilePayments">
      <div className="space-y-6">
        <InstallmentsSection installments={data?.installments ?? []} onRefresh={refresh} />
        <BillsSection bills={data?.bills ?? []} onRefresh={refresh} />
      </div>
    </FeatureGate>
  );
}
