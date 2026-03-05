import { TransactionsLayout } from "@/components/transactions/transactions-layout";

export default function TransactionsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TransactionsLayout>{children}</TransactionsLayout>;
}
