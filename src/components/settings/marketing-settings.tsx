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

export function MarketingSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4" />
            Marketing & Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Submit MoneyStyle to these platforms to get users. Each platform has step-by-step instructions.
            Start with the free auto-promote platforms, then move to paid ads.
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
      {(["auto-promote", "social-media", "campaign-platform", "newsletter", "directory", "paid-ads"] as const).map((type) => {
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
