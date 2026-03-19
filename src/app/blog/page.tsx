import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { getBlogPosts } from "@/actions/blog";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Personal finance tips, budgeting guides, and money management advice from MoneyStyle — the free personal finance tracker.",
  alternates: { canonical: "https://moneystyle.app/blog" },
};

export default async function BlogPage() {
  const posts = await getBlogPosts({ status: "published" });

  return (
    <div className="min-h-screen bg-background">
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
            Blog
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Tips, guides, and insights to help you manage your money better.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block group rounded-2xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
              >
                <Image
                  src={`/blog/${post.slug}/opengraph-image`}
                  alt={post.title}
                  width={1200}
                  height={630}
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <time>
                      {new Date(post.publishedAt!).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} min read
                    </span>
                  </div>
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {post.title}
                    <ArrowRight className="inline ml-2 h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-16">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LogoMark className="h-4 w-4" />
              <span>&copy; 2026 MoneyStyle</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/changelog"
                className="hover:text-foreground transition-colors"
              >
                Changelog
              </Link>
              <Link
                href="/docs/api"
                className="hover:text-foreground transition-colors"
              >
                API Docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
