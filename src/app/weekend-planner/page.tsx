import { Suspense } from "react";
import { WeekendPlannerContent } from "@/components/weekend-planner/weekend-planner-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function WeekendPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      }
    >
      <WeekendPlannerContent />
    </Suspense>
  );
}
