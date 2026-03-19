import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";
export const alt = "MoneyStyle — Free Personal Finance Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
            }}
          >
            <svg viewBox="0 0 512 512" width="56" height="56">
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
          <span style={{ color: "white", fontSize: "36px", fontWeight: 700 }}>
            MoneyStyle
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.2,
              background: "linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Free Personal Finance Tracker
          </span>

          <span
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              maxWidth: "700px",
            }}
          >
            30 features. $0 price. AI-powered.
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "40px" }}>
          {["Receipt Scanner", "Budgets", "Investments", "Subscriptions", "API"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  padding: "8px 20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
