import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionsContent } from "@/components/transactions/transactions-content";
import { getCategories, getAccountsList } from "@/actions/transactions";
import { getPersons } from "@/actions/persons";

export default async function TransactionsListPage() {
  const [categories, accounts, persons] = await Promise.all([
    getCategories().catch(() => []),
    getAccountsList().catch(() => []),
    getPersons().catch(() => []),
  ]);

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      }
    >
      <TransactionsContent
        initialCategories={categories}
        initialAccounts={accounts}
        initialPersons={persons}
      />
    </Suspense>
  );
}
