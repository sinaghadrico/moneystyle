"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Megaphone,
  ExternalLink,
  CheckCircle2,
  Circle,
  Copy,
  Search,
  Globe,
  Mail,
  DollarSign,
  BarChart3,
  Rocket,
  Target,
  Eye,
  MousePointer,
  Users,
  Video,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SUBMIT_TEXT = `Name: MoneyStyle
URL: https://moneystyle.app
Tagline: 100% free AI-powered personal finance tracker with 30+ features
Category: Personal Finance / Budgeting / AI Tools
Pricing: Free
Platforms: Web (PWA)

Description:
MoneyStyle is a 100% free personal finance tracker with AI features:
- AI Receipt Scanning (GPT-4 Vision)
- Voice Transactions (Whisper + GPT-4)
- Spending on Google Maps
- Budget Tracking with Rollover
- Savings Goals with Animated Jar View
- Financial Challenges & Gamification
- Household Sharing with Leaderboard
- Telegram Bot Integration
- Travel Mode for Trip Expenses
- Developer REST API
- And 20+ more features

No subscriptions, no ads. AI features use your own OpenAI key (~$0.01/action).

Alternatives to: YNAB, Mint, Monarch Money, Copilot Money, Rocket Money
Tags: personal finance, budgeting, expense tracker, AI, receipt scanning, free
Founder: Sina Ghadri`;

type Platform = {
  name: string;
  url: string;
  submitUrl: string;
  audience: string;
  cost: string;
  type: "auto-promote" | "newsletter" | "directory" | "paid-ads" | "social-media" | "campaign-platform";
  icon: string;
  guide: string[];
};

const PLATFORMS: Platform[] = [
  // Auto-promote
  {
    name: "Product Hunt",
    url: "producthunt.com",
    submitUrl: "https://producthunt.com/posts/new",
    audience: "1M+ users",
    cost: "Free",
    type: "auto-promote",
    icon: "🚀",
    guide: [
      "Create maker account at producthunt.com",
      "Prepare 6-8 screenshots (mobile + desktop)",
      "Create a 30-second GIF demo",
      "Submit on Tuesday/Wednesday at 00:01 AM PST",
      "Reply to every comment within 30 minutes",
      "Share link on Twitter, LinkedIn, Telegram",
    ],
  },
  {
    name: "AlternativeTo",
    url: "alternativeto.net",
    submitUrl: "https://alternativeto.net/manage/add-application/",
    audience: "High SEO traffic",
    cost: "Free",
    type: "auto-promote",
    icon: "🔄",
    guide: [
      "Go to alternativeto.net → Sign up",
      "Click 'Add Application'",
      "Set as alternative to: YNAB, Mint, Monarch Money",
      "Add screenshots and description",
      "Once listed, anyone searching YNAB/Mint sees MoneyStyle",
    ],
  },
  {
    name: "There's An AI For That",
    url: "theresanaiforthat.com",
    submitUrl: "https://theresanaiforthat.com/submit/",
    audience: "5M monthly visitors",
    cost: "Paid",
    type: "auto-promote",
    icon: "🤖",
    guide: [
      "Go to theresanaiforthat.com/submit",
      "Fill: Name, URL, Description, Category (Finance)",
      "Highlight AI features: Receipt scanning, Voice, Money Pilot",
      "They review and list within 1-3 days",
    ],
  },
  {
    name: "Futurepedia",
    url: "futurepedia.io",
    submitUrl: "https://www.futurepedia.io/submit-tool",
    audience: "3M+ monthly",
    cost: "Free",
    type: "auto-promote",
    icon: "🔮",
    guide: [
      "Go to futurepedia.io/submit-tool",
      "Fill form with AI features focus",
      "Category: Finance / Productivity",
      "They include in newsletter too",
    ],
  },
  {
    name: "SaaSHub",
    url: "saashub.com",
    submitUrl: "https://www.saashub.com/submit",
    audience: "High SEO",
    cost: "Free",
    type: "auto-promote",
    icon: "📊",
    guide: [
      "Go to saashub.com → Create account",
      "Submit product with description",
      "Set as alternative to YNAB, Monarch",
      "Good SEO ranking for 'X alternative' searches",
    ],
  },
  // Newsletters
  {
    name: "Ben's Bites",
    url: "bensbites.com",
    submitUrl: "https://bensbites.com/submit",
    audience: "500K+ subscribers",
    cost: "Free",
    type: "newsletter",
    icon: "📧",
    guide: [
      "Go to bensbites.com/submit",
      "Fill the submit form",
      "Focus on AI angle: receipt scanning, voice, money pilot",
      "They feature AI tools in daily newsletter",
    ],
  },
  {
    name: "TLDR Newsletter",
    url: "tldr.tech",
    submitUrl: "https://tldr.tech/submit",
    audience: "1M+ subscribers",
    cost: "Free",
    type: "newsletter",
    icon: "📰",
    guide: [
      "Go to tldr.tech → Find submit/sponsor page",
      "Submit as interesting tech product",
      "Highlight: free, AI, 30+ features",
    ],
  },
  {
    name: "Console.dev",
    url: "console.dev",
    submitUrl: "https://console.dev",
    audience: "50K+ devs",
    cost: "Free",
    type: "newsletter",
    icon: "💻",
    guide: [
      "Go to console.dev",
      "Submit via their form",
      "Focus on developer angle: API, Next.js, open architecture",
      "They feature dev tools weekly",
    ],
  },
  {
    name: "Uneed",
    url: "uneed.best",
    submitUrl: "https://www.uneed.best/submit",
    audience: "30K+",
    cost: "Free",
    type: "newsletter",
    icon: "⭐",
    guide: [
      "Go to uneed.best/submit",
      "Submit product",
      "Ask friends to upvote (like Product Hunt)",
    ],
  },
  {
    name: "BetaList",
    url: "betalist.com",
    submitUrl: "https://betalist.com/submit",
    audience: "60K+ subscribers",
    cost: "Free (2 week queue) or $129 instant",
    type: "newsletter",
    icon: "🧪",
    guide: [
      "Go to betalist.com/submit",
      "Submit startup details",
      "Free = 2 week wait, Paid = instant feature",
      "They email 60K+ early adopter subscribers",
    ],
  },
  // Directories
  {
    name: "GetApp (Gartner)",
    url: "getapp.com",
    submitUrl: "https://www.getapp.com",
    audience: "High trust, SEO",
    cost: "Free",
    type: "directory",
    icon: "📱",
    guide: [
      "Go to getapp.com → Create vendor profile",
      "Add product details, screenshots",
      "Gartner-owned — high trust signal",
    ],
  },
  {
    name: "G2",
    url: "g2.com",
    submitUrl: "https://www.g2.com/products/new",
    audience: "Enterprise reviews",
    cost: "Free",
    type: "directory",
    icon: "⭐",
    guide: [
      "Go to g2.com → List your product",
      "Create product profile",
      "Ask users to leave reviews",
      "Ranks well for 'best X software' searches",
    ],
  },
  {
    name: "Capterra",
    url: "capterra.com",
    submitUrl: "https://www.capterra.com",
    audience: "High SEO",
    cost: "Free",
    type: "directory",
    icon: "🏆",
    guide: [
      "Go to capterra.com → Create vendor profile",
      "Add product with screenshots and description",
      "High SEO for 'best budgeting software' etc.",
    ],
  },
  {
    name: "AppSumo",
    url: "appsumo.com",
    submitUrl: "https://sell.appsumo.com",
    audience: "1M+ deal hunters",
    cost: "Revenue share",
    type: "directory",
    icon: "🍊",
    guide: [
      "Go to sell.appsumo.com",
      "Apply as partner",
      "Can run lifetime deals",
      "They promote to 1M+ email subscribers",
    ],
  },
];

// Social Media
const SOCIAL_AND_CAMPAIGN_PLATFORMS: Platform[] = [
  {
    name: "Twitter / X",
    url: "x.com",
    submitUrl: "https://x.com/compose/tweet",
    audience: "500M+ users",
    cost: "Free (organic) / $0.25-0.50/click (ads)",
    type: "social-media",
    icon: "𝕏",
    guide: [
      "Create account at x.com if you don't have one",
      "Post launch thread (template in Marketing Playbook)",
      "Use hashtags: #buildinpublic #personalfinance #fintech",
      "For ads: ads.x.com → Promote tweet → $0.25-0.50/click",
      "Best for: launch announcement, build-in-public updates",
    ],
  },
  {
    name: "LinkedIn",
    url: "linkedin.com",
    submitUrl: "https://www.linkedin.com/feed/",
    audience: "900M+ professionals",
    cost: "Free (organic) / $2-5/click (ads)",
    type: "social-media",
    icon: "💼",
    guide: [
      "Post about MoneyStyle on your profile (English + Persian)",
      "Share in groups: Fintech, Startups, Personal Finance",
      "For ads: linkedin.com/campaignmanager → New campaign",
      "Target: Job titles in finance, tech; Interest = budgeting",
      "Best for: B2B, professional audience, Iranian community",
    ],
  },
  {
    name: "Instagram",
    url: "instagram.com",
    submitUrl: "https://www.instagram.com",
    audience: "2B+ users",
    cost: "Free (organic) / $0.10-0.30/click (via Meta Ads)",
    type: "social-media",
    icon: "📸",
    guide: [
      "Create @moneystyle.app account",
      "Post feature screenshots as carousel posts",
      "Reels: 15-sec feature demos (receipt scan, voice, map)",
      "Ads managed via Meta Ads (same as Facebook Ads)",
      "Best for: visual demos, younger audience",
    ],
  },
  {
    name: "TikTok",
    url: "tiktok.com",
    submitUrl: "https://www.tiktok.com/upload",
    audience: "1.5B+ users",
    cost: "Free (organic) / $0.10-0.20/click (ads)",
    type: "social-media",
    icon: "🎵",
    guide: [
      "Create account at tiktok.com",
      "Post short videos: 'This free app replaces YNAB' (15-30 sec)",
      "Show: receipt scanning, voice transaction, money map",
      "For ads: ads.tiktok.com → Cheapest video ads platform",
      "Best for: viral potential, Gen Z/millennial audience",
    ],
  },
  {
    name: "YouTube",
    url: "youtube.com",
    submitUrl: "https://studio.youtube.com",
    audience: "2.5B+ users",
    cost: "Free (organic) / $0.02-0.10/view (ads)",
    type: "social-media",
    icon: "▶️",
    guide: [
      "Create MoneyStyle channel",
      "Upload: 3-5 min full demo video",
      "Upload: 15-sec Shorts for each feature",
      "For ads: ads.google.com → YouTube campaign → Very cheap per view",
      "Best for: detailed demos, SEO (YouTube = 2nd largest search engine)",
    ],
  },
  {
    name: "Reddit",
    url: "reddit.com",
    submitUrl: "https://www.reddit.com/submit",
    audience: "1.5B+ monthly",
    cost: "Free (organic) / $0.20-0.50/click (ads)",
    type: "social-media",
    icon: "🟠",
    guide: [
      "Create account, build karma for a few days",
      "Post in: r/personalfinance, r/ynab, r/SideProject",
      "Use story format, not promotional",
      "For ads: ads.reddit.com → Target specific subreddits",
      "Best for: targeted personal finance audience",
    ],
  },
  {
    name: "Telegram",
    url: "telegram.org",
    submitUrl: "https://t.me/moneystyle_app_bot",
    audience: "800M+ users",
    cost: "Free",
    type: "social-media",
    icon: "✈️",
    guide: [
      "Share bot link in finance/tech groups (UAE, Iran, MENA)",
      "Post demo: type '50 food' in bot → instant transaction",
      "Persian + English groups",
      "No paid ads — only organic group sharing",
      "Best for: MENA market, instant demo via bot",
    ],
  },
  // Campaign platforms (where you create ad campaigns)
  {
    name: "Meta Ads Manager",
    url: "business.facebook.com",
    submitUrl: "https://business.facebook.com/adsmanager",
    audience: "Facebook + Instagram + WhatsApp",
    cost: "$0.10-0.30/click",
    type: "campaign-platform",
    icon: "🎯",
    guide: [
      "Go to business.facebook.com → Create business account",
      "Add payment method (credit/debit card)",
      "Create Campaign → Objective: Traffic or Conversions",
      "Audience: Interest = Personal Finance, Budgeting, Expense Tracker",
      "Age: 22-45, Locations: UAE, US, UK",
      "Ad format: Single image or video (15-sec demo)",
      "Budget: Start $2/day",
      "Landing: moneystyle.app",
      "CHEAPEST ad platform — recommended to start here",
    ],
  },
  {
    name: "Google Ads Campaign",
    url: "ads.google.com",
    submitUrl: "https://ads.google.com/aw/campaigns/new",
    audience: "Google Search + YouTube + Display",
    cost: "$0.30-1.50/click",
    type: "campaign-platform",
    icon: "🔍",
    guide: [
      "Go to ads.google.com → Create account",
      "Add payment method",
      "Campaign type: Search (for keywords) or YouTube (for video)",
      "Keywords: 'free budget app', 'YNAB alternative free', 'expense tracker'",
      "Ad copy: 'Free Finance Tracker — 30+ Features — No Subscription'",
      "Landing: /vs/ynab for YNAB keywords, / for generic",
      "Enable conversion tracking (Google Analytics)",
      "Budget: Start $3/day",
      "Negative keywords: download, android, ios, APK",
    ],
  },
  {
    name: "TikTok Ads Manager",
    url: "ads.tiktok.com",
    submitUrl: "https://ads.tiktok.com/i18n/signup",
    audience: "TikTok users",
    cost: "$0.10-0.20/click",
    type: "campaign-platform",
    icon: "🎵",
    guide: [
      "Go to ads.tiktok.com → Sign up",
      "Add payment method",
      "Create Campaign → Objective: Traffic",
      "Target: Age 18-35, Interest = Finance, Budgeting",
      "Upload short video ad (15-30 sec feature demo)",
      "Budget: Start $2/day",
      "Very cheap — good for video-first content",
    ],
  },
  {
    name: "Reddit Ads Manager",
    url: "ads.reddit.com",
    submitUrl: "https://ads.reddit.com/campaigns/create",
    audience: "Specific subreddits",
    cost: "$0.20-0.50/click",
    type: "campaign-platform",
    icon: "🟠",
    guide: [
      "Go to ads.reddit.com → Create account",
      "Add payment method",
      "Target subreddits: r/personalfinance, r/ynab, r/budgeting",
      "Ad format: Promoted post (looks like normal Reddit post)",
      "Write in casual Reddit tone, not corporate",
      "Budget: Start $1/day",
    ],
  },
  {
    name: "Microsoft / Bing Ads",
    url: "ads.microsoft.com",
    submitUrl: "https://ads.microsoft.com",
    audience: "Bing + Yahoo + MSN search",
    cost: "$0.30-0.80/click",
    type: "campaign-platform",
    icon: "🔵",
    guide: [
      "Go to ads.microsoft.com → Create account",
      "Import campaigns from Google Ads (one-click import!)",
      "Same keywords, 30-50% cheaper than Google",
      "Budget: Start $1/day",
      "Great for low competition, same high intent",
    ],
  },
  {
    name: "Quora Ads",
    url: "quora.com/business",
    submitUrl: "https://www.quora.com/business",
    audience: "Q&A readers (high intent)",
    cost: "$0.30-0.80/click",
    type: "campaign-platform",
    icon: "❓",
    guide: [
      "Go to quora.com/business → Create ad account",
      "Add payment method",
      "Target questions like 'best free budget app'",
      "Ad appears under relevant questions",
      "Budget: Start $2/day",
      "Very high intent — people asking for solutions",
    ],
  },
];

// Merge all platforms
const ALL_PLATFORMS = [...PLATFORMS, ...SOCIAL_AND_CAMPAIGN_PLATFORMS];

const PLATFORM_TYPES = ["auto-promote", "social-media", "campaign-platform", "newsletter", "directory", "paid-ads"] as const;

const TYPE_LABELS: Record<string, { label: string; color: string; icon: typeof Rocket }> = {
  "auto-promote": { label: "Auto-Promote", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: Rocket },
  newsletter: { label: "Newsletter", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Mail },
  directory: { label: "Directory", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400", icon: Globe },
  "paid-ads": { label: "Paid Ads", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: DollarSign },
  "social-media": { label: "Social Media", color: "bg-pink-500/10 text-pink-700 dark:text-pink-400", icon: Megaphone },
  "campaign-platform": { label: "Campaign Platforms", color: "bg-red-500/10 text-red-700 dark:text-red-400", icon: BarChart3 },
};

function copySubmitText() {
  navigator.clipboard.writeText(SUBMIT_TEXT);
  toast.success("Submit text copied to clipboard!");
}

const STRATEGY_PHASES = [
  {
    phase: "Phase 1 — Launch (Week 1-2)",
    budget: "$0",
    badge: "Free",
    badgeColor: "bg-emerald-500/10 text-emerald-700",
    steps: [
      "Make GitHub repo public — get stars from dev communities",
      "Post on Hacker News: 'Show HN: MoneyStyle — Free AI finance tracker with 30+ features'",
      "Submit to Product Hunt (Tuesday/Wednesday, 00:01 AM PST)",
      "Post on Reddit: r/personalfinance, r/selfhosted, r/SideProject (story format, not promo)",
      "Twitter/X thread: #buildinpublic — share the journey, not the product",
      "Submit to all free Auto-Promote platforms below (AlternativeTo, SaaSHub, Futurepedia)",
    ],
  },
  {
    phase: "Phase 2 — Traction (Week 3-6)",
    budget: "$3-5/day",
    badge: "$90-150/mo",
    badgeColor: "bg-blue-500/10 text-blue-700",
    steps: [
      "Start Meta Ads (Facebook/Instagram): $2/day, target Personal Finance interest, age 22-45",
      "Start Bing Ads: $1/day — import from Google Ads, 30-50% cheaper clicks",
      "Write 2 blog posts: 'Free YNAB Alternative' and 'AI Receipt Scanning'",
      "Submit to newsletters: Ben's Bites, TLDR, Console.dev",
      "LinkedIn personal post: 'I built this in my free time and deployed it'",
      "Ask first 50 users for feedback — iterate fast",
    ],
  },
  {
    phase: "Phase 3 — Growth (Month 2-3)",
    budget: "$5-10/day",
    badge: "$150-300/mo",
    badgeColor: "bg-amber-500/10 text-amber-700",
    steps: [
      "Add Google Search Ads: $2-3/day, keywords 'free budget app', 'YNAB alternative'",
      "YouTube Shorts: 15-sec feature demos (receipt scan, voice, money map)",
      "TikTok organic: 'This free app replaces YNAB' style videos",
      "Reddit Ads: $1/day targeting r/personalfinance, r/ynab",
      "Start collecting emails for newsletter on landing page",
      "Submit to directories: G2, Capterra, GetApp for SEO",
    ],
  },
  {
    phase: "Phase 4 — Scale (Month 4+)",
    budget: "$10-20/day",
    badge: "$300-600/mo",
    badgeColor: "bg-purple-500/10 text-purple-700",
    steps: [
      "Scale what works: double budget on best-performing ad platform",
      "Quora Ads: target questions like 'best free budget app'",
      "Influencer outreach: personal finance YouTubers for review",
      "Telegram groups: MENA market (Persian, Arabic finance groups)",
      "Consider AppSumo for lifetime deal campaign",
      "A/B test landing page: try different headlines and CTAs",
    ],
  },
];

const KEY_METRICS = [
  { label: "Don't pay more than", value: "$0.50/click", note: "for Meta/TikTok ads" },
  { label: "Don't pay more than", value: "$1.50/click", note: "for Google Search ads" },
  { label: "Target signup rate", value: "10-20%", note: "of landing page visitors" },
  { label: "Target activation", value: "30%", note: "users who add 5+ transactions" },
  { label: "Best free channel", value: "Product Hunt", note: "can get 500+ signups in 1 day" },
  { label: "Best paid channel", value: "Meta Ads", note: "cheapest CPC, best targeting" },
];

export function MarketingSettings() {
  return (
    <div className="space-y-6">
      {/* Strategy Guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4" />
            Growth Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Follow these phases in order. Start with free channels, validate product-market fit, then scale with paid ads.
          </p>
          {STRATEGY_PHASES.map((phase) => (
            <div key={phase.phase} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{phase.phase}</p>
                <Badge variant="secondary" className={phase.badgeColor}>{phase.badge}</Badge>
              </div>
              <div className="space-y-1">
                {phase.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Circle className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Key Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {KEY_METRICS.map((m) => (
              <div key={m.label + m.value} className="rounded-lg border p-2.5 space-y-0.5">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-sm font-bold">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Strategy by Objective */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Channel Strategy by Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Pick your objective, then follow the recommended channels. Start with free, scale with paid.
          </p>

          {/* Brand Awareness */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold">Brand Awareness</p>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-700 text-[10px]">Reach</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-md bg-muted/50 p-2 space-y-1">
                <p className="text-[10px] font-medium text-emerald-600">Free</p>
                <ul className="text-xs space-y-0.5">
                  <li>Product Hunt launch (1000+ views day 1)</li>
                  <li>Show HN on Hacker News</li>
                  <li>Twitter #buildinpublic posts</li>
                  <li>GitHub repo public + stars</li>
                </ul>
              </div>
              <div className="rounded-md bg-muted/50 p-2 space-y-1">
                <p className="text-[10px] font-medium text-amber-600">Paid ($2-4/day)</p>
                <ul className="text-xs space-y-0.5">
                  <li>TikTok Ads — cheapest CPM</li>
                  <li>YouTube Shorts Ads — 15sec demos</li>
                  <li>Instagram Reels boost</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Website Visits */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-semibold">Website Visits</p>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 text-[10px]">Priority #1</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-md bg-background p-2 space-y-1">
                <p className="text-[10px] font-medium text-emerald-600">Free</p>
                <ul className="text-xs space-y-0.5">
                  <li>Reddit posts (r/personalfinance, r/ynab)</li>
                  <li>SEO blog: &quot;Free YNAB Alternative 2026&quot;</li>
                  <li>AlternativeTo listing</li>
                  <li>SaaSHub listing</li>
                </ul>
              </div>
              <div className="rounded-md bg-background p-2 space-y-1">
                <p className="text-[10px] font-medium text-amber-600">Paid ($3-6/day)</p>
                <ul className="text-xs space-y-0.5">
                  <li>Meta Ads $2/day — CPC $0.10-0.30</li>
                  <li>Google Search $3/day — &quot;free budget app&quot;</li>
                  <li>Bing Ads $1/day — 50% cheaper than Google</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-500" />
              <p className="text-sm font-semibold">Engagement & Community</p>
              <Badge variant="secondary" className="bg-pink-500/10 text-pink-700 text-[10px]">Retention</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-md bg-muted/50 p-2 space-y-1">
                <p className="text-[10px] font-medium text-emerald-600">Free</p>
                <ul className="text-xs space-y-0.5">
                  <li>GitHub Discussions — enable on repo</li>
                  <li>Telegram group (Persian + English)</li>
                  <li>Twitter weekly updates</li>
                  <li>Blog: 1 post/week (AI-generated)</li>
                </ul>
              </div>
              <div className="rounded-md bg-muted/50 p-2 space-y-1">
                <p className="text-[10px] font-medium text-amber-600">Later</p>
                <ul className="text-xs space-y-0.5">
                  <li>Discord server (after 200+ users)</li>
                  <li>Email newsletter (after 500+ signups)</li>
                  <li>Community challenges / rewards</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Video Views */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-red-500" />
              <p className="text-sm font-semibold">Video Views</p>
              <Badge variant="secondary" className="bg-red-500/10 text-red-700 text-[10px]">Viral potential</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-md bg-muted/50 p-2 space-y-1">
                <p className="text-[10px] font-medium text-emerald-600">Content ideas</p>
                <ul className="text-xs space-y-0.5">
                  <li>15sec: Scan receipt → instant transaction</li>
                  <li>15sec: Say &quot;250 carrefour&quot; → voice transaction</li>
                  <li>15sec: Money Map — where you spend on a real map</li>
                  <li>30sec: &quot;This free app has 30 features&quot; tour</li>
                </ul>
              </div>
              <div className="rounded-md bg-muted/50 p-2 space-y-1">
                <p className="text-[10px] font-medium text-amber-600">Platforms</p>
                <ul className="text-xs space-y-0.5">
                  <li>YouTube Shorts (organic first)</li>
                  <li>TikTok (organic, then $2/day ads)</li>
                  <li>Instagram Reels (reuse TikTok content)</li>
                  <li>Promote best-performing video</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conversions */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-semibold">Signups & Conversions</p>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 text-[10px]">After 500 visits/day</Badge>
            </div>
            <div className="rounded-md bg-muted/50 p-2">
              <ul className="text-xs space-y-0.5">
                <li>Install Facebook Pixel now (for retargeting later)</li>
                <li>Google Ads with conversion tracking → optimize for signups</li>
                <li>Quora Ads — target &quot;best free budget app&quot; questions</li>
                <li>Retarget landing page visitors who didn&apos;t sign up</li>
                <li>A/B test headlines: &quot;Free&quot; vs &quot;AI-Powered&quot; vs &quot;Replace YNAB&quot;</li>
              </ul>
            </div>
          </div>

          {/* Priority table */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-xs font-semibold">Priority Order</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1 pr-3">#</th>
                    <th className="text-left py-1 pr-3">Channel</th>
                    <th className="text-left py-1 pr-3">Cost</th>
                    <th className="text-left py-1">When</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-dashed"><td className="py-1 pr-3">1</td><td className="pr-3">Product Hunt + Hacker News</td><td className="pr-3 text-emerald-600">Free</td><td>Week 1</td></tr>
                  <tr className="border-b border-dashed"><td className="py-1 pr-3">2</td><td className="pr-3">Reddit + GitHub</td><td className="pr-3 text-emerald-600">Free</td><td>Week 1-2</td></tr>
                  <tr className="border-b border-dashed"><td className="py-1 pr-3">3</td><td className="pr-3">Meta Ads (IG/FB)</td><td className="pr-3">$2/day</td><td>Week 3</td></tr>
                  <tr className="border-b border-dashed"><td className="py-1 pr-3">4</td><td className="pr-3">Google Search Ads</td><td className="pr-3">$3/day</td><td>Month 2</td></tr>
                  <tr className="border-b border-dashed"><td className="py-1 pr-3">5</td><td className="pr-3">TikTok / YouTube Shorts</td><td className="pr-3">$2/day</td><td>Month 2</td></tr>
                  <tr><td className="py-1 pr-3">6</td><td className="pr-3">Quora + Bing Ads</td><td className="pr-3">$2/day</td><td>Month 3</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4" />
            Platforms & Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Submit MoneyStyle to these platforms to get users. Each platform has step-by-step instructions.
          </p>

          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([type, info]) => {
              const Icon = info.icon;
              const count = ALL_PLATFORMS.filter((p) => p.type === type).length;
              if (count === 0) return null;
              return (
                <Badge key={type} variant="secondary" className={info.color}>
                  <Icon className="h-3 w-3 mr-1" />
                  {count} {info.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Copy-paste submit text */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Submit Text (Copy-Paste)
            </CardTitle>
            <Button size="sm" variant="outline" onClick={copySubmitText} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
            {SUBMIT_TEXT}
          </pre>
        </CardContent>
      </Card>

      {/* Budget recommendation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Recommended Budget Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Low Budget</p>
              <p className="text-lg font-bold">$3<span className="text-xs text-muted-foreground font-normal">/day</span></p>
              <p className="text-xs text-muted-foreground">~$90/month</p>
              <p className="text-xs">Facebook $2 + Bing $1</p>
              <p className="text-xs text-emerald-500">~230-675 clicks</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
              <p className="text-xs text-emerald-600">Recommended</p>
              <p className="text-lg font-bold">$5<span className="text-xs text-muted-foreground font-normal">/day</span></p>
              <p className="text-xs text-muted-foreground">~$150/month</p>
              <p className="text-xs">Facebook $2 + Google $2 + Bing $1</p>
              <p className="text-xs text-emerald-500">~270-795 clicks</p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Growth</p>
              <p className="text-lg font-bold">$10<span className="text-xs text-muted-foreground font-normal">/day</span></p>
              <p className="text-xs text-muted-foreground">~$300/month</p>
              <p className="text-xs">Facebook $4 + Google $3 + Bing $2 + Reddit $1</p>
              <p className="text-xs text-emerald-500">~550-1610 clicks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform sections */}
      {PLATFORM_TYPES.map((type) => {
        const typeInfo = TYPE_LABELS[type];
        const platforms = ALL_PLATFORMS.filter((p) => p.type === type);
        const TypeIcon = typeInfo.icon;

        return (
          <div key={type} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <TypeIcon className="h-4 w-4" />
              {typeInfo.label}
              <Badge variant="secondary" className={typeInfo.color}>
                {platforms.length}
              </Badge>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {platforms.map((platform) => (
                <PlatformCard key={platform.name} platform={platform} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  const typeInfo = TYPE_LABELS[platform.type];

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{platform.icon}</span>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm">{platform.name}</h4>
              <p className="text-xs text-muted-foreground">{platform.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className={`text-[10px] ${typeInfo.color}`}>
              {platform.cost}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {platform.audience}
            </Badge>
          </div>
        </div>

        {/* Step by step guide */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">How to connect:</p>
          {platform.guide.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-muted-foreground shrink-0 mt-0.5 w-4 text-right">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => window.open(platform.submitUrl, "_blank")}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open {platform.name}
        </Button>
      </CardContent>
    </Card>
  );
}
