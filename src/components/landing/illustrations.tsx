"use client";

// ── Professional SVG Illustrations with CSS animations ──

export function PhoneFinanceIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow behind phone */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl scale-75 animate-pulse" />

      <svg viewBox="0 0 320 400" className="relative w-full h-auto drop-shadow-2xl" fill="none">
        <defs>
          <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>
          <linearGradient id="barGrad1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="barGrad2" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
          <filter id="phoneShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.15" />
          </filter>
          <filter id="cardShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Phone body */}
        <rect x="60" y="20" width="200" height="360" rx="36" fill="url(#phoneGrad)" filter="url(#phoneShadow)" />
        <rect x="68" y="28" width="184" height="344" rx="30" fill="url(#screenGrad)" />

        {/* Notch */}
        <rect x="120" y="34" width="80" height="6" rx="3" fill="#d1d5db" />

        {/* Status bar */}
        <text x="82" y="58" fontSize="10" fill="#6b7280" fontWeight="500">MoneyStyle</text>
        <circle cx="232" cy="54" r="4" fill="#10b981" />

        {/* Balance card */}
        <rect x="82" y="68" width="156" height="65" rx="12" fill="white" filter="url(#cardShadow)" />
        <text x="94" y="86" fontSize="9" fill="#9ca3af">Total Balance</text>
        <text x="94" y="108" fontSize="22" fill="#111827" fontWeight="700">$4,847</text>
        <text x="94" y="122" fontSize="9" fill="#10b981" fontWeight="500">+12.4% this month</text>
        <circle cx="218" cy="95" r="16" fill="#ecfdf5">
          <animate attributeName="r" values="16;18;16" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M212 95 L218 88 L224 95 L218 92Z" fill="#10b981">
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </path>

        {/* Chart section */}
        <text x="82" y="155" fontSize="10" fill="#374151" fontWeight="600">Spending</text>

        {/* Animated bars */}
        <rect x="88" y="200" width="22" height="0" rx="4" fill="url(#barGrad1)">
          <animate attributeName="height" values="0;45;45" dur="1.2s" fill="freeze" begin="0.3s" />
          <animate attributeName="y" values="200;155;155" dur="1.2s" fill="freeze" begin="0.3s" />
        </rect>
        <rect x="118" y="200" width="22" height="0" rx="4" fill="url(#barGrad2)">
          <animate attributeName="height" values="0;65;65" dur="1.2s" fill="freeze" begin="0.5s" />
          <animate attributeName="y" values="200;135;135" dur="1.2s" fill="freeze" begin="0.5s" />
        </rect>
        <rect x="148" y="200" width="22" height="0" rx="4" fill="url(#barGrad1)">
          <animate attributeName="height" values="0;35;35" dur="1.2s" fill="freeze" begin="0.7s" />
          <animate attributeName="y" values="200;165;165" dur="1.2s" fill="freeze" begin="0.7s" />
        </rect>
        <rect x="178" y="200" width="22" height="0" rx="4" fill="url(#barGrad2)">
          <animate attributeName="height" values="0;55;55" dur="1.2s" fill="freeze" begin="0.9s" />
          <animate attributeName="y" values="200;145;145" dur="1.2s" fill="freeze" begin="0.9s" />
        </rect>
        <rect x="208" y="200" width="22" height="0" rx="4" fill="url(#barGrad1)">
          <animate attributeName="height" values="0;75;75" dur="1.2s" fill="freeze" begin="1.1s" />
          <animate attributeName="y" values="200;125;125" dur="1.2s" fill="freeze" begin="1.1s" />
        </rect>

        {/* Base line */}
        <line x1="82" y1="202" x2="236" y2="202" stroke="#e5e7eb" strokeWidth="1" />

        {/* Bottom cards */}
        <rect x="82" y="220" width="74" height="50" rx="10" fill="white" filter="url(#cardShadow)" />
        <circle cx="98" cy="238" r="8" fill="#fef3c7" />
        <text x="95" y="241" fontSize="8" fill="#f59e0b">$</text>
        <text x="112" y="240" fontSize="8" fill="#374151" fontWeight="600">Savings</text>
        <text x="112" y="256" fontSize="11" fill="#111827" fontWeight="700">$1,200</text>

        <rect x="164" y="220" width="74" height="50" rx="10" fill="white" filter="url(#cardShadow)" />
        <circle cx="180" cy="238" r="8" fill="#dbeafe" />
        <text x="177" y="241" fontSize="8" fill="#3b82f6">B</text>
        <text x="194" y="240" fontSize="8" fill="#374151" fontWeight="600">Budget</text>
        <text x="194" y="256" fontSize="11" fill="#10b981" fontWeight="700">68%</text>

        {/* Bottom nav */}
        <rect x="82" y="300" width="156" height="44" rx="14" fill="white" filter="url(#cardShadow)" />
        <circle cx="112" cy="322" r="5" fill="#10b981" />
        <circle cx="148" cy="322" r="5" fill="#d1d5db" />
        <circle cx="184" cy="322" r="5" fill="#d1d5db" />
        <circle cx="220" cy="322" r="5" fill="#d1d5db" />

        {/* Home indicator */}
        <rect x="130" y="354" width="60" height="4" rx="2" fill="#d1d5db" />

        {/* Floating notification */}
        <g>
          <rect x="170" y="5" width="120" height="36" rx="10" fill="white" filter="url(#cardShadow)">
            <animate attributeName="y" values="10;5;10" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
          </rect>
          <circle cx="186" cy="23" r="6" fill="#10b981">
            <animate attributeName="cy" values="28;23;28" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="196" y="20" fontSize="7" fill="#374151" fontWeight="600">
            <animate attributeName="y" values="25;20;25" dur="3s" repeatCount="indefinite" />
            Receipt scanned!
          </text>
          <text x="196" y="30" fontSize="6" fill="#9ca3af">
            <animate attributeName="y" values="35;30;35" dur="3s" repeatCount="indefinite" />
            Carrefour — $47.80
          </text>
        </g>

        {/* Floating coins */}
        <circle cx="40" cy="150" r="14" fill="#fbbf24" opacity="0.8">
          <animate attributeName="cy" values="160;140;160" dur="4s" repeatCount="indefinite" />
        </circle>
        <text x="35" y="155" fontSize="14" fill="#92400e" fontWeight="bold">
          $
          <animate attributeName="y" values="165;145;165" dur="4s" repeatCount="indefinite" />
        </text>

        <circle cx="285" cy="200" r="11" fill="#fbbf24" opacity="0.6">
          <animate attributeName="cy" values="210;190;210" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <text x="281" y="204" fontSize="11" fill="#92400e" fontWeight="bold">
          $
          <animate attributeName="y" values="214;194;214" dur="3.5s" repeatCount="indefinite" />
        </text>

        <circle cx="50" cy="300" r="9" fill="#34d399" opacity="0.5">
          <animate attributeName="cy" values="310;295;310" dur="5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export function ReceiptScanIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-amber-500/15 rounded-full blur-3xl scale-75 animate-pulse" />
      <svg viewBox="0 0 300 300" className="relative w-full h-auto" fill="none">
        <defs>
          <filter id="receiptShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1" />
          </filter>
          <linearGradient id="scanBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Receipt paper */}
        <path d="M80 30 L80 250 L85 245 L90 250 L95 245 L100 250 L105 245 L110 250 L115 245 L120 250 L125 245 L130 250 L135 245 L140 250 L145 245 L150 250 L155 245 L160 250 L165 245 L170 250 L175 245 L180 250 L185 245 L190 250 L195 245 L200 250 L205 245 L210 250 L215 245 L220 250 L220 30 Z"
          fill="white" filter="url(#receiptShadow)" stroke="#e5e7eb" strokeWidth="1">
          <animate attributeName="d"
            values="M80 30 L80 250 L85 245 L90 250 L95 245 L100 250 L105 245 L110 250 L115 245 L120 250 L125 245 L130 250 L135 245 L140 250 L145 245 L150 250 L155 245 L160 250 L165 245 L170 250 L175 245 L180 250 L185 245 L190 250 L195 245 L200 250 L205 245 L210 250 L215 245 L220 250 L220 30 Z;
                   M80 25 L80 250 L85 245 L90 250 L95 245 L100 250 L105 245 L110 250 L115 245 L120 250 L125 245 L130 250 L135 245 L140 250 L145 245 L150 250 L155 245 L160 250 L165 245 L170 250 L175 245 L180 250 L185 245 L190 250 L195 245 L200 250 L205 245 L210 250 L215 245 L220 250 L220 25 Z;
                   M80 30 L80 250 L85 245 L90 250 L95 245 L100 250 L105 245 L110 250 L115 245 L120 250 L125 245 L130 250 L135 245 L140 250 L145 245 L150 250 L155 245 L160 250 L165 245 L170 250 L175 245 L180 250 L185 245 L190 250 L195 245 L200 250 L205 245 L210 250 L215 245 L220 250 L220 30 Z"
            dur="3s" repeatCount="indefinite" />
        </path>

        {/* Store name */}
        <rect x="110" y="45" width="80" height="8" rx="4" fill="#374151" />
        <rect x="120" y="58" width="60" height="5" rx="2.5" fill="#d1d5db" />

        {/* Divider */}
        <line x1="95" y1="72" x2="205" y2="72" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />

        {/* Line items */}
        <rect x="95" y="82" width="70" height="5" rx="2.5" fill="#9ca3af" />
        <rect x="185" y="82" width="25" height="5" rx="2.5" fill="#374151" />

        <rect x="95" y="96" width="55" height="5" rx="2.5" fill="#9ca3af" />
        <rect x="185" y="96" width="25" height="5" rx="2.5" fill="#374151" />

        <rect x="95" y="110" width="65" height="5" rx="2.5" fill="#9ca3af" />
        <rect x="185" y="110" width="25" height="5" rx="2.5" fill="#374151" />

        <rect x="95" y="124" width="50" height="5" rx="2.5" fill="#9ca3af" />
        <rect x="185" y="124" width="25" height="5" rx="2.5" fill="#374151" />

        {/* Divider */}
        <line x1="95" y1="140" x2="205" y2="140" stroke="#e5e7eb" strokeWidth="1" />

        {/* Total */}
        <rect x="95" y="150" width="40" height="7" rx="3.5" fill="#374151" />
        <rect x="170" y="148" width="40" height="10" rx="5" fill="#10b981" />
        <text x="178" y="157" fontSize="8" fill="white" fontWeight="700">$47.80</text>

        {/* Scan beam */}
        <rect x="75" y="80" width="150" height="4" rx="2" fill="url(#scanBeam)">
          <animate attributeName="y" values="40;240;40" dur="2.5s" repeatCount="indefinite" />
        </rect>

        {/* AI badge */}
        <rect x="225" y="100" width="55" height="28" rx="14" fill="#10b981">
          <animate attributeName="y" values="105;95;105" dur="2s" repeatCount="indefinite" />
        </rect>
        <text x="236" y="118" fontSize="10" fill="white" fontWeight="700">
          AI
          <animate attributeName="y" values="123;113;123" dur="2s" repeatCount="indefinite" />
        </text>
        <text x="249" y="118" fontSize="10" fill="white">
          ✓
          <animate attributeName="y" values="123;113;123" dur="2s" repeatCount="indefinite" />
        </text>

        {/* Sparkles */}
        <circle cx="240" cy="60" r="4" fill="#fbbf24">
          <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="130" r="3" fill="#fbbf24">
          <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="260" cy="180" r="3.5" fill="#34d399">
          <animate attributeName="r" values="3;5.5;3" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Check marks appearing */}
        <g opacity="0">
          <animate attributeName="opacity" values="0;1;1" dur="1.5s" fill="freeze" begin="1s" />
          <circle cx="88" cy="84" r="6" fill="#d1fae5" />
          <path d="M85 84 L87 86 L91 82" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1;1" dur="1.5s" fill="freeze" begin="1.5s" />
          <circle cx="88" cy="98" r="6" fill="#d1fae5" />
          <path d="M85 98 L87 100 L91 96" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1;1" dur="1.5s" fill="freeze" begin="2s" />
          <circle cx="88" cy="112" r="6" fill="#d1fae5" />
          <path d="M85 112 L87 114 L91 110" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function DashboardIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-indigo-500/15 rounded-full blur-3xl scale-75 animate-pulse" />
      <svg viewBox="0 0 320 260" className="relative w-full h-auto" fill="none">
        <defs>
          <linearGradient id="dashGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="dashShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Main card */}
        <rect x="20" y="10" width="280" height="200" rx="16" fill="white" filter="url(#dashShadow)" />

        {/* Header */}
        <circle cx="40" cy="30" r="6" fill="#ef4444" />
        <circle cx="56" cy="30" r="6" fill="#fbbf24" />
        <circle cx="72" cy="30" r="6" fill="#22c55e" />
        <text x="170" y="34" fontSize="9" fill="#9ca3af" textAnchor="middle">Dashboard</text>

        {/* Donut chart */}
        <circle cx="75" cy="100" r="35" stroke="#e5e7eb" strokeWidth="10" fill="none" />
        <circle cx="75" cy="100" r="35" stroke="#10b981" strokeWidth="10" fill="none"
          strokeDasharray="110 220" strokeLinecap="round" transform="rotate(-90 75 100)">
          <animate attributeName="stroke-dasharray" values="0 220;110 220" dur="1.5s" fill="freeze" begin="0.3s" />
        </circle>
        <circle cx="75" cy="100" r="35" stroke="#3b82f6" strokeWidth="10" fill="none"
          strokeDasharray="55 220" strokeDashoffset="-110" strokeLinecap="round" transform="rotate(-90 75 100)">
          <animate attributeName="stroke-dasharray" values="0 220;55 220" dur="1.5s" fill="freeze" begin="0.6s" />
        </circle>
        <circle cx="75" cy="100" r="35" stroke="#f59e0b" strokeWidth="10" fill="none"
          strokeDasharray="35 220" strokeDashoffset="-165" strokeLinecap="round" transform="rotate(-90 75 100)">
          <animate attributeName="stroke-dasharray" values="0 220;35 220" dur="1.5s" fill="freeze" begin="0.9s" />
        </circle>
        <text x="75" y="98" fontSize="14" fill="#111827" fontWeight="700" textAnchor="middle">68%</text>
        <text x="75" y="110" fontSize="7" fill="#9ca3af" textAnchor="middle">of budget</text>

        {/* Bar chart */}
        {[140, 165, 190, 215, 240, 265].map((x, i) => (
          <rect key={x} x={x} y={160} width="16" height="0" rx="3" fill={i % 2 === 0 ? "url(#dashGrad)" : "#14b8a6"} opacity={0.7 + i * 0.05}>
            <animate attributeName="height" values={`0;${30 + i * 12}`} dur="1s" fill="freeze" begin={`${0.3 + i * 0.15}s`} />
            <animate attributeName="y" values={`160;${160 - 30 - i * 12}`} dur="1s" fill="freeze" begin={`${0.3 + i * 0.15}s`} />
          </rect>
        ))}

        {/* Trend line */}
        <polyline points="148,140 173,125 198,132 223,110 248,118 273,95"
          stroke="url(#lineGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="200" strokeDashoffset="200">
          <animate attributeName="stroke-dashoffset" values="200;0" dur="2s" fill="freeze" begin="1s" />
        </polyline>

        {/* Trend arrow */}
        <circle cx="273" cy="95" r="4" fill="#8b5cf6" opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="2.5s" />
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin="2.5s" />
        </circle>

        {/* Mini stat cards below */}
        <rect x="20" y="222" width="85" height="32" rx="8" fill="white" filter="url(#dashShadow)" />
        <text x="30" y="236" fontSize="7" fill="#9ca3af">Income</text>
        <text x="30" y="248" fontSize="10" fill="#10b981" fontWeight="700">+$4,200</text>

        <rect x="117" y="222" width="85" height="32" rx="8" fill="white" filter="url(#dashShadow)" />
        <text x="127" y="236" fontSize="7" fill="#9ca3af">Expenses</text>
        <text x="127" y="248" fontSize="10" fill="#ef4444" fontWeight="700">-$2,847</text>

        <rect x="215" y="222" width="85" height="32" rx="8" fill="white" filter="url(#dashShadow)" />
        <text x="225" y="236" fontSize="7" fill="#9ca3af">Saved</text>
        <text x="225" y="248" fontSize="10" fill="#3b82f6" fontWeight="700">$1,353</text>
      </svg>
    </div>
  );
}

export function SavingsIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-green-500/15 rounded-full blur-3xl scale-75 animate-pulse" />
      <svg viewBox="0 0 280 300" className="relative w-full h-auto" fill="none">
        <defs>
          <linearGradient id="jarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
          <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <clipPath id="jarClip">
            <rect x="65" y="80" width="150" height="160" rx="20" />
          </clipPath>
          <filter id="jarShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Jar body */}
        <rect x="65" y="80" width="150" height="160" rx="20" fill="url(#jarGrad)" stroke="#6ee7b7" strokeWidth="2" filter="url(#jarShadow)" />

        {/* Jar lid */}
        <rect x="85" y="60" width="110" height="26" rx="8" fill="#a7f3d0" stroke="#6ee7b7" strokeWidth="2" />
        <rect x="120" y="52" width="40" height="12" rx="6" fill="#6ee7b7" />

        {/* Liquid — animated fill */}
        <g clipPath="url(#jarClip)">
          <rect x="65" y="200" width="150" height="40" fill="url(#liquidGrad)" opacity="0.8">
            <animate attributeName="y" values="220;160;220" dur="6s" repeatCount="indefinite" />
            <animate attributeName="height" values="20;80;20" dur="6s" repeatCount="indefinite" />
          </rect>
          {/* Wave */}
          <path d="M65 200 Q100 195 140 200 Q180 205 215 200 L215 240 L65 240 Z" fill="#10b981" opacity="0.3">
            <animate attributeName="d"
              values="M65 200 Q100 195 140 200 Q180 205 215 200 L215 240 L65 240 Z;
                     M65 200 Q100 205 140 200 Q180 195 215 200 L215 240 L65 240 Z;
                     M65 200 Q100 195 140 200 Q180 205 215 200 L215 240 L65 240 Z"
              dur="3s" repeatCount="indefinite" />
            <animate attributeName="transform" type="translate" values="0,0;0,-40;0,0" dur="6s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Coins dropping */}
        <g>
          <circle cx="140" cy="10" r="16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
            <animate attributeName="cy" values="-20;10;50;80" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;1;1;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="135" y="15" fontSize="14" fill="#92400e" fontWeight="bold">
            $
            <animate attributeName="y" values="-15;15;55;85" dur="2s" repeatCount="indefinite" />
          </text>
        </g>

        {/* Second coin — offset */}
        <g>
          <circle cx="110" cy="10" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5">
            <animate attributeName="cy" values="-30;0;45;80" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="opacity" values="1;1;1;0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
          </circle>
          <text x="106" y="14" fontSize="11" fill="#92400e" fontWeight="bold">
            $
            <animate attributeName="y" values="-26;4;49;84" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
          </text>
        </g>

        {/* Progress label */}
        <rect x="90" y="255" width="100" height="30" rx="15" fill="white" filter="url(#jarShadow)" />
        <text x="112" y="274" fontSize="10" fill="#10b981" fontWeight="700">78% 🎯</text>

        {/* Target label */}
        <text x="100" y="295" fontSize="9" fill="#6b7280">Vacation Fund</text>

        {/* Sparkles */}
        <circle cx="50" cy="120" r="4" fill="#fbbf24">
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="235" cy="100" r="3" fill="#34d399">
          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="240" cy="200" r="5" fill="#fbbf24" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
