import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getBlogPosts, type BlogPostData } from "@/actions/blog";

export async function LatestPosts() {
  const posts = await getBlogPosts({ status: "published", limit: 4 });

  if (posts.length === 0) return null;

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From the Blog
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Tips, guides, and insights to help you manage your money better.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={`/blog/${post.slug}/opengraph-image`}
                  alt={post.title}
                  width={600}
                  height={338}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                  <time>
                    {new Date(post.publishedAt!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {post.readingTime}m
                  </span>
                </div>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground"
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
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all posts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
