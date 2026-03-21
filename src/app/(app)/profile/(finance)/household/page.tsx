import { HouseholdSection } from "@/components/profile/household-section";
import { HouseholdLeaderboard } from "@/components/profile/household-leaderboard";

export default function HouseholdPage() {
  return (
    <div className="space-y-6">
      <HouseholdSection />
      <HouseholdLeaderboard />
    </div>
  );
}
