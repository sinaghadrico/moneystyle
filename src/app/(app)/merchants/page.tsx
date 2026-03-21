import { MerchantsContent } from "@/components/merchants/merchants-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchants",
};

export default function MerchantsPage() {
  return <MerchantsContent />;
}
