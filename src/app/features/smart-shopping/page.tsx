import type { Metadata } from "next";
import { SmartShoppingLanding } from "@/components/features/smart-shopping-landing";

export const metadata: Metadata = {
  title: "Smart Shopping — MoneyLoom",
  description:
    "Build your shopping list, compare prices across stores from your own data, and find the cheapest way to shop — single store or split strategy.",
};

export default function SmartShoppingPage() {
  return <SmartShoppingLanding />;
}
