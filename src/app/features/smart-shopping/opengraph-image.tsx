import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "MoneyLoom Smart Shopping — Compare prices, split across stores, save more";
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
        {/* Background glows */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(132,204,22,0.12) 0%, transparent 70%)",
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
            background:
              "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Left: text content */}
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
              background: "rgba(132,204,22,0.15)",
              borderRadius: "999px",
              padding: "5px 14px",
              alignSelf: "flex-start",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#84cc16"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 11-1 9" />
              <path d="m19 11-4-7" />
              <path d="M2 11h20" />
              <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
              <path d="m5 11 4-7" />
              <path d="m9 11 1 9" />
            </svg>
            <span
              style={{ color: "#84cc16", fontSize: "13px", fontWeight: 600 }}
            >
              Smart Shopping
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
            <span style={{ color: "white" }}>Shop Smarter,</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #84cc16, #10b981, #14b8a6)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Save More
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
            Compare prices from your history. Best store or split strategy for
            maximum savings.
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
            position: "relative",
          }}
        >
          {/* Phone notch */}
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

          {/* Phone screen content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "12px 16px",
              gap: "10px",
              flex: 1,
            }}
          >
            {/* Screen header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#84cc16"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 11-1 9" />
                <path d="m19 11-4-7" />
                <path d="M2 11h20" />
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
                <path d="m5 11 4-7" />
                <path d="m9 11 1 9" />
              </svg>
              <span
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                My Basket
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "12px",
                  marginLeft: "auto",
                }}
              >
                5 items
              </span>
            </div>

            {/* Items */}
            {["Whole Milk 1L", "Sourdough Bread", "Eggs (12)", "Olive Oil", "Cheddar"].map(
              (item, i) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "11px",
                    }}
                  >
                    x{i < 2 ? 2 : 1}
                  </span>
                </div>
              )
            )}

            {/* Best store result */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(132,204,22,0.1) 100%)",
                borderRadius: "14px",
                padding: "12px 14px",
                border: "1px solid rgba(16,185,129,0.2)",
                marginTop: "auto",
                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>🏆</span>
                <span
                  style={{
                    color: "#10b981",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Best: GreenGrocer
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                  }}
                >
                  Split & save
                </span>
                <span
                  style={{
                    color: "#84cc16",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  $23.50
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
