import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparison, getAllComparisonSlugs } from "@/lib/comparison-data";
import { ComparisonLanding } from "@/components/comparisons/comparison-landing";

export function generateStaticParams() {
  return getAllComparisonSlugs().map((competitor) => ({ competitor }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const comparison = getComparison(competitor);
  if (!comparison) return {};

  const title = `MoneyStyle vs ${comparison.name} — Free Alternative`;
  const description = comparison.tagline;

  return {
    title,
    description,
    alternates: {
      canonical: `https://moneystyle.app/vs/${competitor}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "MoneyStyle",
      url: `https://moneystyle.app/vs/${competitor}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const comparison = getComparison(competitor);
  if (!comparison) notFound();

  return <ComparisonLanding comparison={comparison} />;
}
