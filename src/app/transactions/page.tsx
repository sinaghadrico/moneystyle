import { Suspense } from "react";
import { TransactionsContent } from "@/components/transactions/transactions-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
