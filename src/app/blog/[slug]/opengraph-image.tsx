import { ImageResponse } from "next/og";
import { getBlogPost } from "@/actions/blog";

export const dynamic = "force-dynamic";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function BlogOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const title = post?.title ?? "MoneyStyle Blog";
  const tags = post?.tags?.slice(0, 3) ?? [];
  const readingTime = post?.readingTime ?? 5;
  const author = post?.authorName ?? "MoneyStyle";

  // Generate a consistent color based on slug
  const THEMES = [
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)", accent: "#6366f1" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #1a2e1a 50%, #0a0a0a 100%)", accent: "#10b981" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #2e1a1a 50%, #0a0a0a 100%)", accent: "#f43f5e" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #2e2a1a 50%, #0a0a0a 100%)", accent: "#f59e0b" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)", accent: "#8b5cf6" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #1a2e2e 50%, #0a0a0a 100%)", accent: "#06b6d4" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #2e1a2e 50%, #0a0a0a 100%)", accent: "#ec4899" },
    { bg: "linear-gradient(135deg, #0a0a0a 0%, #1e2e1a 50%, #0a0a0a 100%)", accent: "#84cc16" },
  ];

  // Hash slug to pick theme
  let hash = 0;
  for (const ch of slug) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  const theme = THEMES[Math.abs(hash) % THEMES.length];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: theme.bg,
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Top — Logo + Blog badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
              }}
            >
              <svg viewBox="0 0 512 512" width="44" height="44">
                <defs>
                  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <rect width="512" height="512" rx="112" fill="url(#bg)" />
                <path d="M128 368 L128 176 L216 288 L256 208 L296 288 L384 144 L384 368" stroke="white" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="384" cy="144" r="22" fill="white" />
              </svg>
            </div>
            <span style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>MoneyStyle</span>
          </div>
          <div
            style={{
              display: "flex",
              background: `${theme.accent}22`,
              borderRadius: "999px",
              padding: "6px 18px",
              border: `1px solid ${theme.accent}44`,
            }}
          >
            <span style={{ color: theme.accent, fontSize: "14px", fontWeight: 600 }}>Blog</span>
          </div>
        </div>

        {/* Middle — Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          <span
            style={{
              fontSize: title.length > 60 ? "40px" : title.length > 40 ? "48px" : "56px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "900px",
            }}
          >
            {title}
          </span>
        </div>

        {/* Bottom — Tags + Meta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 500 }}>
                  {tag}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              {readingTime} min read
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              by {author}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
