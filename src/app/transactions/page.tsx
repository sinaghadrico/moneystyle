import { TransactionsPageContent } from "@/components/transactions/transactions-page-content";
import { getCategories, getAccountsList } from "@/actions/transactions";
import { getPersons } from "@/actions/persons";

export default async function TransactionsPage() {
  const [categories, accounts, persons] = await Promise.all([
    getCategories().catch(() => []),
    getAccountsList().catch(() => []),
    getPersons().catch(() => []),
  ]);

  return (
    <TransactionsPageContent
      initialCategories={categories}
      initialAccounts={accounts}
      initialPersons={persons}
    />
  );
}
