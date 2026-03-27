import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft, Clock, User } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { getBlogPost, getBlogPosts } from "@/actions/blog";
import { recordBlogView } from "@/actions/blog";
import Image from "next/image";
import { headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    alternates: { canonical: `https://moneystyle.app/blog/${slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: [post.authorName],
      tags: post.tags,
      images: [
        {
          url: `/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      images: [`/blog/${slug}/opengraph-image`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post || post.status !== "published") notFound();

  // Record view server-side
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  const ua = hdrs.get("user-agent") || "unknown";
  const lang = hdrs.get("accept-language") || "";
  recordBlogView(post.id, ip, ua, lang); // fire-and-forget, no await

  // Simple markdown to HTML (headers, bold, links, lists, paragraphs)
  const html = markdownToHtml(post.content);

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.authorName,
      url: "https://moneystyle.app/about",
    },
    publisher: {
      "@type": "Organization",
      name: "MoneyStyle",
      url: "https://moneystyle.app",
      logo: { "@type": "ImageObject", url: "https://moneystyle.app/logo.png" },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `https://moneystyle.app/blog/${slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="text-sm font-bold">MoneyStyle</span>
            </Link>
          </div>
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <article>
          {/* Cover image */}
          <div className="rounded-2xl overflow-hidden mb-8 border">
            <Image
              src={`/blog/${slug}/opengraph-image`}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto"
            />
          </div>

          <header className="mb-8">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <time>
                {new Date(post.publishedAt!).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min read
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {post.authorName}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-li:text-base prose-li:leading-7 prose-a:text-primary prose-a:underline-offset-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:text-base prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-8 text-center">
          <h2 className="text-xl font-bold">Track Your Money — Free</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            30 features. No subscription. No credit card.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-4"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

// Markdown → HTML converter with proper spacing
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockContent: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" = "ul";

  function closeList() {
    if (inList) {
      output.push(`</${listType}>`);
      inList = false;
    }
  }

  function processInline(text: string): string {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" rel="noopener noreferrer">$1</a>',
      );
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        output.push(
          `<pre><code class="language-${codeBlockLang}">${codeBlockContent.join("\n")}</code></pre>`,
        );
        codeBlockContent = [];
        inCodeBlock = false;
        continue;
      }
      inCodeBlock = true;
      codeBlockLang = line.slice(3).trim();
      continue;
    }
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      closeList();
      continue;
    }

    // Headings
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      closeList();
      output.push(`<h3>${processInline(h3Match[1])}</h3>`);
      continue;
    }

    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      closeList();
      output.push(`<h2>${processInline(h2Match[1])}</h2>`);
      continue;
    }

    const h1Match = line.match(/^# (.+)$/);
    if (h1Match) {
      closeList();
      output.push(`<h1>${processInline(h1Match[1])}</h1>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      closeList();
      output.push("<hr />");
      continue;
    }

    // Image
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      closeList();
      output.push(`<figure class="my-8 mx-auto max-w-md"><img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="w-full rounded-xl border" loading="lazy" />${imgMatch[1] && imgMatch[1] !== "Infographic" ? `<figcaption class="text-center text-xs text-gray-500 mt-2">${imgMatch[1]}</figcaption>` : ""}</figure>`);
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^> (.+)$/);
    if (bqMatch) {
      closeList();
      output.push(
        `<blockquote><p>${processInline(bqMatch[1])}</p></blockquote>`,
      );
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*] (.+)$/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        closeList();
        output.push("<ul>");
        inList = true;
        listType = "ul";
      }
      output.push(`<li>${processInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\. (.+)$/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        output.push("<ol>");
        inList = true;
        listType = "ol";
      }
      output.push(`<li>${processInline(olMatch[1])}</li>`);
      continue;
    }

    // Paragraph
    closeList();
    output.push(`<p>${processInline(line)}</p>`);
  }

  closeList();
  return output.join("\n");
}
