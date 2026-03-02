import { getPersonSummary } from "@/actions/persons";
import { PersonSummaryContent } from "@/components/persons/person-summary-content";
import { notFound } from "next/navigation";

export default async function PersonSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const summary = await getPersonSummary(id);

  if (!summary) notFound();

  return <PersonSummaryContent summary={summary} />;
}
