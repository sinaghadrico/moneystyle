import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MoneyLoom — AI-powered personal finance tracker";
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
        {/* Glows */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "200px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "150px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Left content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingRight: "40px",
            gap: "20px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <svg
                width="24"
                height="24"
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
                color: "white",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              MoneyLoom
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-2px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ color: "white" }}>End of month.</span>
            <span style={{ color: "white" }}>Money gone.</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #8b5cf6, #ec4899, #f43f5e)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Sound familiar?
            </span>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "440px",
            }}
          >
            AI-powered finance tracking. Know where every dollar goes.
          </p>

          {/* Pills */}
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            {["Free to start", "AI-powered", "No credit card"].map((label) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Phone mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "300px",
            height: "500px",
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
            {/* Dashboard header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "10px",
                  }}
                >
                  This month
                </span>
                <span
                  style={{
                    color: "white",
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  $2,847
                </span>
              </div>
              <div
                style={{
                  background: "rgba(16,185,129,0.15)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                }}
              >
                <span
                  style={{
                    color: "#10b981",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  -12%
                </span>
              </div>
            </div>

            {/* Chart bars */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "4px",
                height: "60px",
              }}
            >
              {[40, 65, 35, 80, 55, 70, 45, 60, 75, 50, 85, 30].map(
                (h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: "3px",
                      background:
                        i === 10
                          ? "rgba(139,92,246,0.8)"
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                )
              )}
            </div>

            {/* Categories */}
            {[
              { label: "Groceries", value: "$342", pct: 70, color: "#3b82f6" },
              { label: "Dining", value: "$185", pct: 38, color: "#8b5cf6" },
              { label: "Transport", value: "$128", pct: 26, color: "#10b981" },
            ].map((cat) => (
              <div
                key={cat.label}
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "10px",
                    }}
                  >
                    {cat.label}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {cat.value}
                  </span>
                </div>
                <div
                  style={{
                    height: "5px",
                    borderRadius: "3px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cat.pct}%`,
                      borderRadius: "3px",
                      background: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Receipt notification */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(139,92,246,0.12)",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid rgba(139,92,246,0.2)",
                marginTop: "auto",
              }}
            >
              <span style={{ fontSize: "16px" }}>🧾</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Receipt scanned
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "10px",
                  }}
                >
                  5 items · $23.76 · Auto-saved
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
