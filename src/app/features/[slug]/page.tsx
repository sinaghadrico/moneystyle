import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeature, getAllSlugs } from "@/lib/feature-data";
import { FeatureLanding } from "@/components/features/feature-landing";

export function generateStaticParams() {
  return getAllSlugs()
    .filter((slug) => slug !== "smart-shopping")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) return {};

  const description = feature.tagline;

  return {
    title: `${feature.title} — MoneyLoom`,
    description,
    openGraph: {
      title: `${feature.title} — MoneyLoom`,
      description,
      type: "website",
      siteName: "MoneyLoom",
    },
    twitter: {
      card: "summary_large_image",
      title: `${feature.title} — MoneyLoom`,
      description,
    },
  };
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();

  return <FeatureLanding feature={feature} />;
}
