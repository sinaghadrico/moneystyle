import { TravelContent } from "@/components/travel/travel-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel",
};

export default function TravelPage() {
  return <TravelContent />;
}
