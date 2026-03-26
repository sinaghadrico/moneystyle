"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { storage } from "@/lib/storage";

// ── Types ──

export type BlogPostData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  tags: string[];
  readingTime: number;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

// ── Helpers ──

async function requireAdmin() {
  const userId = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }
  return userId;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

async function getOpenAI(): Promise<OpenAI> {
  const settings = await prisma.appSettings.findFirst({
    where: { user: { role: "admin" } },
    select: { openaiApiKey: true },
  });
  const apiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No OpenAI API key configured");
  return new OpenAI({ apiKey });
}

// ── CRUD ──

export async function getBlogPosts(opts?: {
  status?: string;
  limit?: number;
}): Promise<BlogPostData[]> {
  const where = opts?.status ? { status: opts.status } : {};
  const posts = await prisma.blogPost.findMany({
    where,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: opts?.limit,
  });

  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    status: p.status,
    tags: p.tags,
    readingTime: p.readingTime,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    authorName: p.author.name ?? "MoneyStyle",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  const p = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    status: p.status,
    tags: p.tags,
    readingTime: p.readingTime,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    authorName: p.author.name ?? "MoneyStyle",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function createBlogPost(data: {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string | null;
}) {
  const userId = await requireAdmin();
  const slug = slugify(data.title);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) return { error: "A post with this slug already exists" };

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: data.title.trim(),
      content: data.content,
      excerpt: data.excerpt?.trim() || null,
      tags: data.tags ?? [],
      status: data.status ?? "draft",
      readingTime: estimateReadingTime(data.content),
      seoTitle: data.seoTitle?.trim() || null,
      seoDescription: data.seoDescription?.trim() || null,
      coverImage: data.coverImage ?? null,
      publishedAt: data.status === "published" ? new Date() : null,
      authorId: userId,
    },
  });

  revalidatePath("/blog");
  return { success: true, slug: post.slug };
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
  }
) {
  await requireAdmin();

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found" };

  const wasPublished = existing.status === "published";
  const isPublishing = data.status === "published" && !wasPublished;

  await prisma.blogPost.update({
    where: { id },
    data: {
      ...(data.title ? { title: data.title.trim(), slug: slugify(data.title) } : {}),
      ...(data.content ? { content: data.content, readingTime: estimateReadingTime(data.content) } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt?.trim() || null } : {}),
      ...(data.tags ? { tags: data.tags } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle?.trim() || null } : {}),
      ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription?.trim() || null } : {}),
      ...(isPublishing ? { publishedAt: new Date() } : {}),
    },
  });

  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  return { success: true };
}

// ── AI Generator ──

async function getAiMemory(): Promise<Record<string, string>> {
  const rows = await prisma.blogAiMemory.findMany();
  const mem: Record<string, string> = {};
  for (const r of rows) mem[r.key] = r.value;
  return mem;
}

async function setAiMemory(key: string, value: string) {
  await prisma.blogAiMemory.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function generateBlogPost(opts: {
  topic: string;
  tone?: string;
  targetKeywords?: string[];
  length?: "short" | "medium" | "long";
}) {
  await requireAdmin();
  const openai = await getOpenAI();

  // Load AI memory
  const memory = await getAiMemory();
  const pastTopics = memory.pastTopics ?? "";
  const brandVoice = memory.brandVoice ?? "";
  const performanceNotes = memory.performanceNotes ?? "";

  // Get existing post titles to avoid duplicates
  const existingPosts = await prisma.blogPost.findMany({
    select: { title: true, tags: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const existingTitles = existingPosts.map((p) => p.title).join("\n");

  const lengthGuide = {
    short: "800-1200 words",
    medium: "1500-2500 words",
    long: "3000-4000 words",
  }[opts.length ?? "medium"];

  const systemPrompt = `You are an expert SEO content writer for MoneyStyle — a 100% free personal finance tracker with 30 features. AI features use the user's own OpenAI API key.

BRAND CONTEXT:
- MoneyStyle is completely free, no subscriptions, no hidden fees
- Features: expense tracking, AI receipt scanning, budgets, savings goals, investment tracking (stocks/ETFs with live prices), subscription detection, household sharing, developer API, meal planner, weekend planner, money chat, money pilot, bill negotiator, cashflow calendar, spending wrapped, and more
- Target audience: anyone who wants to manage their money better — globally
- Tone: helpful, clear, data-backed, not salesy
- Founded by Sina Ghadri
- Website: moneystyle.app

${brandVoice ? `BRAND VOICE NOTES:\n${brandVoice}\n` : ""}
${performanceNotes ? `PERFORMANCE NOTES (what worked before):\n${performanceNotes}\n` : ""}
${pastTopics ? `PREVIOUSLY WRITTEN TOPICS (avoid repeating):\n${pastTopics}\n` : ""}
EXISTING POSTS (do not duplicate):
${existingTitles}

SEO BEST PRACTICES — YOU MUST FOLLOW ALL:
1. **Title**: Engaging, unique, includes primary keyword naturally. Max 60 chars for SEO title. Don't always start with "How to" — vary: lists, questions, statements, power words
2. **Excerpt**: 1-2 compelling sentences that make people click. Include primary keyword
3. **Structure**: Use H2 for main sections, H3 for subsections. Every 200-300 words should have a heading
4. **First paragraph**: Hook the reader immediately. Include primary keyword in the first 100 words
5. **Keywords**: Use target keywords naturally throughout (2-3% density). Include in H2 headings, first paragraph, and conclusion
6. **Internal links**: Mention MoneyStyle features naturally with context (e.g., "tools like MoneyStyle's subscription detection can help")
7. **Statistics**: Include 3-5 real statistics with sources (Federal Reserve, NBER, Gallup, Bureau of Labor Statistics, etc.)
8. **Lists**: Use bullet points and numbered lists for scannable content
9. **Readability**: Short paragraphs (2-3 sentences max). Simple language. Active voice
10. **Emojis**: Use emojis in H2 headings and key points to make content scannable and engaging (e.g., "💰 Why Tracking Matters", "📊 The Numbers Don't Lie", "🎯 Action Steps")
11. **CTA**: End with a natural, non-pushy mention of MoneyStyle
12. **Meta**: SEO title max 60 chars with keyword. SEO description max 155 chars, compelling, with keyword
13. **Quotes**: Include 1-2 expert quotes or blockquotes for E-E-A-T
14. **FAQ potential**: Structure some content as questions (H2/H3) that could appear in Google's "People Also Ask"
15. **Freshness signals**: Reference current year (2026), recent data, current trends

EMOJI STYLE GUIDE:
- Use emojis at the START of H2 headings: "## 💡 Smart Ways to Save"
- Use emojis in list items for visual scanning: "- 🔍 Track every expense"
- Use emojis in key takeaways and tips
- Don't overdo it — 1 emoji per heading, occasional in body text
- Match emoji to topic: 💰💵 money, 📊📈 data/charts, 🎯 goals, 🏠 home, 🛒 shopping, ✅ tips, ⚠️ warnings, 💡 ideas, 🔑 key points

Target length: ${lengthGuide}
${opts.targetKeywords?.length ? `Target SEO keywords: ${opts.targetKeywords.join(", ")}` : ""}
${opts.tone ? `Tone: ${opts.tone}` : ""}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Write a blog post about: ${opts.topic}\n\nRespond in this JSON format:\n{"title": "...", "excerpt": "...", "content": "...(markdown)...", "tags": ["tag1", "tag2"], "seoTitle": "...(max 60 chars)...", "seoDescription": "...(max 155 chars)..."}`,
      },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  if (!raw) return { error: "AI returned empty response" };

  let parsed: {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
  };

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Failed to parse AI response" };
  }

  // Update AI memory with this topic
  const updatedTopics = pastTopics
    ? `${pastTopics}\n- ${parsed.title}`
    : `- ${parsed.title}`;
  await setAiMemory("pastTopics", updatedTopics);

  // Generate infographic with DALL-E and inject into content
  let finalContent = parsed.content;
  try {
    const infographicUrl = await generateBlogInfographic(openai, parsed.title, parsed.tags);
    if (infographicUrl) {
      // Find the second ## heading and insert before it
      let firstH2 = finalContent.indexOf("\n## ");
      if (firstH2 >= 0) {
        const secondH2 = finalContent.indexOf("\n## ", firstH2 + 4);
        const insertAt = secondH2 >= 0 ? secondH2 : firstH2;
        finalContent =
          finalContent.slice(0, insertAt) +
          `\n\n![Infographic](${infographicUrl})\n` +
          finalContent.slice(insertAt);
      }
    }
  } catch (err) {
    console.error("DALL-E infographic generation failed:", err);
  }

  const hasInfographic = finalContent !== parsed.content;

  return {
    success: true,
    imageGenerated: hasInfographic,
    post: {
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: finalContent,
      tags: parsed.tags,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
    },
  };
}

async function generateBlogInfographic(
  openai: OpenAI,
  title: string,
  tags: string[]
): Promise<string | null> {
  const prompt = `A clean, modern infographic illustration for a personal finance article about "${title}". Flat design, data visualization, emerald green and teal color palette on dark background. Pie charts, bar graphs, money icons. No text. Professional style. Tags: ${tags.slice(0, 3).join(", ")}`;

  // Try DALL-E 3 first, fallback to DALL-E 2
  let imageUrl: string | undefined;
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    imageUrl = response.data?.[0]?.url;
  } catch (e) {
    console.error("DALL-E 3 failed, trying DALL-E 2:", e);
    try {
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      imageUrl = response.data?.[0]?.url;
    } catch (e2) {
      console.error("DALL-E 2 also failed:", e2);
      return null;
    }
  }

  if (!imageUrl) return null;

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) return null;
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  const fileName = `blog/${Date.now()}-infographic.png`;
  await storage.upload(fileName, buffer, "image/png");
  return storage.getPublicUrl(fileName);
}

export async function suggestBlogTopics() {
  await requireAdmin();
  const openai = await getOpenAI();

  const memory = await getAiMemory();
  const pastTopics = memory.pastTopics ?? "";

  const existingPosts = await prisma.blogPost.findMany({
    select: { title: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an SEO strategist for MoneyStyle, a free personal finance tracker with 30 features. Suggest blog topics that:
- Target high-volume, low-competition long-tail keywords
- Answer "People Also Ask" questions on Google
- Attract organic traffic from people searching for personal finance help
- Can naturally mention MoneyStyle features
- Cover different stages: awareness (general finance tips), consideration (tool comparisons), decision (why MoneyStyle)
- Mix formats: how-to guides, listicles, data-driven analysis, beginner guides, comparison posts
Avoid topics already covered.

Already written:
${existingPosts.map((p) => `- ${p.title}`).join("\n")}
${pastTopics ? `\nPast topics in memory:\n${pastTopics}` : ""}`,
      },
      {
        role: "user",
        content: 'Suggest 8 blog post topics. Return JSON: {"topics": [{"title": "...", "keywords": ["..."], "description": "one line why this topic"}]}',
      },
    ],
    temperature: 0.9,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  if (!raw) return { error: "AI returned empty response" };

  try {
    return { success: true, ...JSON.parse(raw) };
  } catch {
    return { error: "Failed to parse AI response" };
  }
}

export async function updateBrandVoice(notes: string) {
  await requireAdmin();
  await setAiMemory("brandVoice", notes);
  return { success: true };
}

export async function updatePerformanceNotes(notes: string) {
  await requireAdmin();
  await setAiMemory("performanceNotes", notes);
  return { success: true };
}

export async function getAiMemoryData() {
  await requireAdmin();
  return getAiMemory();
}

// ── Saved Topics ──

export type SavedTopic = {
  title: string;
  keywords: string[];
  description: string;
};

export async function getSavedTopics(): Promise<SavedTopic[]> {
  await requireAdmin();
  const mem = await getAiMemory();
  if (!mem.savedTopics) return [];
  try {
    return JSON.parse(mem.savedTopics);
  } catch {
    return [];
  }
}

export async function saveTopic(topic: SavedTopic) {
  await requireAdmin();
  const topics = await getSavedTopics();
  const exists = topics.some((t) => t.title === topic.title);
  if (!exists) {
    topics.push(topic);
    await setAiMemory("savedTopics", JSON.stringify(topics));
  }
  return { success: true };
}

export async function saveAllTopics(topics: SavedTopic[]) {
  await requireAdmin();
  await setAiMemory("savedTopics", JSON.stringify(topics));
  return { success: true };
}

export async function removeSavedTopic(title: string) {
  await requireAdmin();
  const topics = await getSavedTopics();
  const filtered = topics.filter((t) => t.title !== title);
  await setAiMemory("savedTopics", JSON.stringify(filtered));
  return { success: true };
}

// ── Blog View Tracking ──

import crypto from "crypto";

export async function recordBlogView(postId: string, ip: string, ua: string, lang: string) {
  const fingerprint = crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${lang}`)
    .digest("hex")
    .slice(0, 32);

  try {
    await prisma.blogPostView.upsert({
      where: { postId_fingerprint: { postId, fingerprint } },
      update: {},
      create: { postId, fingerprint },
    });
  } catch {
    // ignore - post may not exist or duplicate
  }
}

export async function getBlogViewCounts(): Promise<Record<string, number>> {
  await requireAdmin();
  const counts = await prisma.blogPostView.groupBy({
    by: ["postId"],
    _count: { id: true },
  });
  const map: Record<string, number> = {};
  for (const c of counts) {
    map[c.postId] = c._count.id;
  }
  return map;
}
