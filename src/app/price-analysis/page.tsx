import { Suspense } from "react";
import { PriceAnalysisContent } from "@/components/price-analysis/price-analysis-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function PriceAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      }
    >
      <PriceAnalysisContent />
    </Suspense>
  );
}
