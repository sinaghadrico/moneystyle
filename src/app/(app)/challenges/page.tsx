import { ChallengesContent } from "@/components/challenges/challenges-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges",
};

export default function ChallengesPage() {
  return <ChallengesContent />;
}
