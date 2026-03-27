import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { CHANGELOG } from "@/lib/changelog-data";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "See what's new in MoneyStyle — latest features, improvements, and fixes for the free personal finance tracker.",
  alternates: {
    canonical: "https://moneystyle.app/changelog",
  },
};

const TYPE_STYLES = {
  feature: {
    label: "New",
    bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  },
  improvement: {
    label: "Improved",
    bg: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  fix: {
    label: "Fixed",
    bg: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="text-sm font-bold">MoneyStyle</span>
            </Link>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Changelog
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Changelog</h1>
          <p className="mt-2 text-muted-foreground">
            New features, improvements, and fixes shipped to MoneyStyle.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-12">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-emerald-500 bg-background" />

                {/* Header */}
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                    v{entry.version}
                  </span>
                  <time className="text-sm text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>

                <h2 className="text-xl font-bold mb-1">{entry.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {entry.description}
                </p>

                {/* Changes */}
                <div className="space-y-2">
                  {entry.changes.map((change, i) => {
                    const style = TYPE_STYLES[change.type];
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className={`shrink-0 mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${style.bg}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-sm">{change.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
