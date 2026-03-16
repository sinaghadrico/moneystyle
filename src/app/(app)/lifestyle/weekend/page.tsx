import { WeekendPlannerContent } from "@/components/weekend-planner/weekend-planner-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function WeekendPage() {
  return (
    <FeatureGate feature="weekendPlanner">
      <WeekendPlannerContent />
    </FeatureGate>
  );
}
