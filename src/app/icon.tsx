import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
      >
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#bg)" />
        <path
          d="M128 368 L128 176 L216 288 L256 208 L296 288 L384 144 L384 368"
          stroke="white"
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="384" cy="144" r="22" fill="white" />
      </svg>
    ),
    { ...size }
  );
}
