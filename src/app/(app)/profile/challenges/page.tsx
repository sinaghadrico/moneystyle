"use client";

import { ChallengesContent } from "@/components/challenges/challenges-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function ProfileChallengesPage() {
  return (
    <FeatureGate feature="profileChallenges">
      <ChallengesContent />
    </FeatureGate>
  );
}
