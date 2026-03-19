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
              borderRadius: "14px",
              background: "linear-gradient(135deg, #10b981, #14b8a6)",
            }}
          >
            <span style={{ color: "white", fontSize: "28px", fontWeight: 800 }}>M</span>
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
