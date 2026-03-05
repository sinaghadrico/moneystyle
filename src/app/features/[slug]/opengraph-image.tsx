import { ImageResponse } from "next/og";
import { getFeature } from "@/lib/feature-data";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }

  const { hex, hexSecondary, badge, headline, headlineAccent, tagline, ogPhone } =
    feature;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "40px",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hex}20 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hexSecondary}18 0%, transparent 70%)`,
          }}
        />

        {/* Left text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingRight: "40px",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              MoneyLoom
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: `${hex}25`,
              borderRadius: "999px",
              padding: "5px 14px",
              alignSelf: "flex-start",
            }}
          >
            <span
              style={{ color: hex, fontSize: "13px", fontWeight: 600 }}
            >
              {badge}
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ color: "white" }}>{headline}</span>
            <span
              style={{
                background: `linear-gradient(90deg, ${hex}, ${hexSecondary})`,
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {headlineAccent}
            </span>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "420px",
            }}
          >
            {tagline.length > 120 ? tagline.slice(0, 117) + "..." : tagline}
          </p>
        </div>

        {/* Right: Phone mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "320px",
            height: "520px",
            borderRadius: "36px",
            background: "#111118",
            border: "3px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Notch */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "10px",
              paddingBottom: "6px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.15)",
              }}
            />
          </div>

          {/* Screen */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "12px 16px",
              gap: "10px",
              flex: 1,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {ogPhone.title}
              </span>
            </div>

            {/* Items */}
            {ogPhone.items.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}

            {/* Result */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: `linear-gradient(135deg, ${hex}20 0%, ${hexSecondary}15 100%)`,
                borderRadius: "14px",
                padding: "12px 14px",
                border: `1px solid ${hex}30`,
                marginTop: "auto",
                gap: "6px",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "11px",
                }}
              >
                {ogPhone.resultLabel}
              </span>
              <span
                style={{
                  color: hex,
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                {ogPhone.resultValue}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
