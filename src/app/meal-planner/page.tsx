import { Suspense } from "react";
import { MealPlannerContent } from "@/components/meal-planner/meal-planner-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function MealPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      }
    >
      <MealPlannerContent />
    </Suspense>
  );
}
