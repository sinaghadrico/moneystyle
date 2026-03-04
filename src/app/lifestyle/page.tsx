import { Suspense } from "react";
import { LifestyleContent } from "@/components/lifestyle/lifestyle-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function LifestylePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      }
    >
      <LifestyleContent initialTab="money-advice" />
    </Suspense>
  );
}
