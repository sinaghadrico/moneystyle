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
    title: `${feature.title} — MoneyStyle`,
    description,
    openGraph: {
      title: `${feature.title} — MoneyStyle`,
      description,
      type: "website",
      siteName: "MoneyStyle",
      images: [
        {
          url: `/features/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${feature.title} — MoneyStyle`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${feature.title} — MoneyStyle`,
      description,
      images: [
        {
          url: `/features/${slug}/twitter-image`,
          width: 1200,
          height: 630,
          alt: `${feature.title} — MoneyStyle`,
        },
      ],
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
