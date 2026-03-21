# MoneyStyle — Marketing Playbook

> **Goal:** Bring first 1,000 users to moneystyle.app
> **Budget:** Start with $0 (organic), scale to $5-10/day paid
> **Timeline:** Week 1-4 launch plan
> **Last Updated:** March 2026

---

## Table of Contents

1. [Launch Day Checklist](#1-launch-day-checklist)
2. [Product Hunt Launch](#2-product-hunt-launch)
3. [Reddit Strategy](#3-reddit-strategy)
4. [Hacker News](#4-hacker-news)
5. [Twitter/X Strategy](#5-twitterx-strategy)
6. [LinkedIn Strategy](#6-linkedin-strategy)
7. [SEO & Blog Content](#7-seo--blog-content)
8. [Developer Communities](#8-developer-communities)
9. [Listing Sites](#9-listing-sites)
10. [Telegram & MENA Market](#10-telegram--mena-market)
11. [YouTube](#11-youtube)
12. [Auto-Promote Platforms](#12-auto-promote-platforms-submit-once-they-promote-for-you)
13. [Paid Channels](#13-paid-channels)
14. [Ready-to-Use Copy](#14-ready-to-use-copy)
15. [Weekly Schedule](#15-weekly-schedule)
16. [KPIs & Tracking](#16-kpis--tracking)

---

## 1. Launch Day Checklist

Before any marketing, make sure these are ready:

- [ ] Landing page polished (moneystyle.app)
- [ ] Demo account works (try live / demo login)
- [ ] Screenshots ready (6-8 high-quality, mobile + desktop)
- [ ] GIF/video demo (30-60 seconds)
- [ ] One-liner ready: "100% free personal finance tracker with 30 features and AI"
- [ ] Social accounts created (Twitter, LinkedIn, Product Hunt maker profile)
- [ ] Google Analytics + Clarity running
- [ ] OG images working (test with https://opengraph.xyz)
- [ ] Blog has at least 2-3 posts

---

## 2. Product Hunt Launch

**URL:** https://producthunt.com

**Timing:**
- Best days: Tuesday, Wednesday, Thursday
- Post at: 00:01 AM PST (11:31 AM Iran time)
- Avoid: Mondays (competition from big companies), Fridays/weekends (low traffic)

**Preparation (1 week before):**
- Create maker profile on Product Hunt
- Follow 50-100 active Product Hunt users
- Prepare all assets

**Submission Details:**

```
Name: MoneyStyle
Tagline: Free AI-powered personal finance tracker with 30+ features

Description:
MoneyStyle is a 100% free personal finance tracker with 30+ features:

💰 Track expenses, income, budgets, and savings goals
🤖 AI receipt scanning — snap a photo, auto-extract items
🗣️ Voice transactions — say "50 dirhams coffee" and it's logged
🗺️ Money Map — see your spending on Google Maps
📊 Wealth Pilot — AI scores your financial health
🍽️ Meal & Weekend Planner — AI-powered lifestyle features
📱 Telegram bot — log expenses from Telegram
🏆 Financial challenges & gamification
👨‍👩‍👧 Household sharing with leaderboard
🔧 Developer API

No subscriptions. No ads. AI features use your own OpenAI key (~$0.01/action).

Built with Next.js 16, Prisma, PostgreSQL, and GPT-4.
```

**Topics:** Personal Finance, Artificial Intelligence, Productivity, Budgeting

**Screenshots needed (in order):**
1. Dashboard overview
2. Transaction list (mobile)
3. AI receipt scanning
4. Money Map (Google Maps)
5. Voice transaction recording
6. Spending Wrapped cards
7. Weekend/Meal planner
8. Telegram bot conversation

**Launch Day Actions:**
- [ ] Post at 00:01 PST
- [ ] Share link with friends/family immediately
- [ ] Reply to EVERY comment within 30 minutes
- [ ] Post update on Twitter, LinkedIn, Telegram
- [ ] Monitor and engage all day

**Expected Results:**
- Top 5: 2,000-5,000 visits
- Top 10: 500-2,000 visits
- Featured: 5,000-15,000 visits

---

## 3. Reddit Strategy

### Target Subreddits

| Subreddit | Members | Approach | Post Type |
|-----------|---------|----------|-----------|
| r/personalfinance | 18M+ | Value-first, no self-promo | Comment on "what app do you use" threads |
| r/ynab | 150K+ | "I switched from YNAB" story | Personal experience post |
| r/Frugal | 3M+ | "Free alternative to paid apps" | Tip/recommendation |
| r/selfhosted | 400K+ | Technical setup guide | How-to post |
| r/SideProject | 60K+ | Show what you built | Launch post |
| r/webdev | 1M+ | Technical deep-dive | "I built this with Next.js 16" |
| r/nextjs | 100K+ | Technical showcase | Architecture post |
| r/IndieHackers | 50K+ | Build story | Journey post |
| r/fintech | 50K+ | Industry perspective | Feature analysis |

### Post Templates

**r/ynab (Best performing):**
```
Title: I was paying $15/month for YNAB. Built a free alternative with AI features.

Body:
After 2 years of YNAB, I realized I was paying $180/year for features I could build myself.
So I did — and added AI on top.

MoneyStyle has 30+ features including:
- Budget tracking with rollover (like YNAB!)
- AI receipt scanning
- Voice transactions ("50 dirhams coffee")
- Spending on Google Maps
- Meal & weekend planner
- Telegram bot for quick logging

It's 100% free. No catch. AI features use your own OpenAI key (~$0.01 per action).

Try it: moneystyle.app

Happy to answer any questions about the tech or features.
```

**r/SideProject:**
```
Title: I built a free personal finance app with 30+ features — MoneyStyle

Body:
Hey everyone! Been working on this for a few months and finally ready to share.

MoneyStyle is a personal finance tracker with features that usually cost $10-15/month:

[list top 10 features]

Tech stack: Next.js 16, Prisma, PostgreSQL, GPT-4, Google Maps, Telegram Bot API

It's free and open for signups at moneystyle.app

Would love feedback!
```

### Rules
- Never post the same content to multiple subreddits
- Wait 2-3 days between posts in different subreddits
- Engage in comments for at least 24 hours after posting
- If a post gets removed, don't repost — message mods
- Build karma first by commenting helpfully in each subreddit for a few days

---

## 4. Hacker News

**URL:** https://news.ycombinator.com

**Post Format:**
```
Title: Show HN: MoneyStyle – Free AI-powered personal finance tracker (30+ features)
URL: https://moneystyle.app
```

**Comment (post immediately after submission):**
```
Hi HN! I built MoneyStyle as a free alternative to YNAB/Monarch/Mint.

Key technical decisions:
- Next.js 16 with App Router and Server Actions
- Prisma ORM + PostgreSQL
- GPT-4 for receipt scanning, voice parsing, and financial advice
- Google Maps JavaScript API for spending map
- Telegram Bot API for quick expense logging
- PWA with service worker (Serwist)

AI features use BYOK (bring your own key) model — users set their own OpenAI API key.
This keeps the app 100% free with no subscription needed.

Some features I'm proud of:
- Voice transactions: say "50 dirhams coffee" → Whisper transcribes → GPT-4 parses → pre-fills form
- Money Map: transactions plotted on Google Maps with color-coded pins by amount
- Financial challenges: gamification with streaks, badges, and household leaderboards

Would love technical feedback!
```

**Timing:** Post between 8-10 AM EST on weekdays

**Expected Results:**
- Front page: 5,000-20,000 visits
- Page 2-3: 500-2,000 visits

---

## 5. Twitter/X Strategy

### Profile Setup
```
Name: MoneyStyle
Handle: @moneystyle_app
Bio: 100% free personal finance tracker with 30+ features. AI receipt scanning, voice transactions, Google Maps spending, and more. No subscriptions.
Link: moneystyle.app
```

### Launch Thread Template
```
🧵 I built a 100% free personal finance app with 30+ features.

No subscriptions. No ads. No data selling.

Here's every feature explained:

[Thread continues — 1 tweet per feature with screenshot]

1/ 📊 Smart Dashboard
Real-time overview with charts, heatmaps, budget progress, and AI predictions.
[screenshot]

2/ 🤖 AI Receipt Scanner
Snap a photo → AI extracts every line item, price, and merchant.
[screenshot]

3/ 🎤 Voice Transactions
Say "50 dirhams coffee" → AI transcribes and fills the form.
[screenshot]

4/ 🗺️ Money Map
See your spending on Google Maps. Color-coded pins by amount.
[screenshot]

...continue for top 15 features...

15/ It's free at moneystyle.app

If you found this useful, RT the first tweet 🙏

#buildinpublic #personalfinance #fintech #indiehacker
```

### Ongoing Content Calendar
| Day | Content Type |
|-----|-------------|
| Monday | Feature spotlight (1 feature deep-dive) |
| Tuesday | Tip: "Did you know you can..." |
| Wednesday | Behind the scenes / tech decision |
| Thursday | User feedback / testimonial |
| Friday | Weekly stats (transparent metrics) |
| Saturday | Comparison: "MoneyStyle vs X" |
| Sunday | Rest or engagement (reply to others) |

### Hashtags
```
#buildinpublic #personalfinance #fintech #indiehacker #solofounder
#nextjs #typescript #saas #budgeting #moneytips #ai #gpt4
```

---

## 6. LinkedIn Strategy

### Post Template (English)
```
I built a 100% free personal finance app with 30+ features.

While apps like YNAB charge $180/year and Monarch charges $100/year,
MoneyStyle gives you everything for free:

✅ Budget tracking with rollover
✅ AI receipt scanning
✅ Voice-to-transaction
✅ Spending on Google Maps
✅ Household sharing
✅ Financial challenges & gamification
✅ Developer API
...and 23 more features

The business model? AI features use your own OpenAI key (~$0.01/action).
No subscriptions, no ads, no data selling.

Built with: Next.js, TypeScript, PostgreSQL, GPT-4, Google Maps

Try it free: moneystyle.app

What feature would you add? 👇

#personalfinance #fintech #buildinpublic #startup
```

### Post Template (Persian — for Iranian LinkedIn community)
```
یه اپ مدیریت مالی شخصی ساختم با ۳۰+ فیچر — کاملا رایگان.

در حالی که اپ‌هایی مثل YNAB سالی ۱۸۰ دلار هزینه دارن،
MoneyStyle همه امکانات رو رایگان میده:

✅ ردیابی بودجه با انتقال به ماه بعد
✅ اسکن رسید با هوش مصنوعی
✅ ثبت تراکنش با صدا
✅ نمایش خرج‌ها روی نقشه گوگل
✅ اشتراک‌گذاری خانواده
✅ چالش‌های مالی و گیمیفیکیشن

تکنولوژی: Next.js 16, TypeScript, PostgreSQL, GPT-4

رایگان تست کنید: moneystyle.app

#استارتاپ #فین_تک #مدیریت_مالی #برنامه_نویسی
```

---

## 7. SEO & Blog Content

### Comparison Pages (Already Built!)
These pages target high-intent search queries:

| Page | Target Keywords |
|------|----------------|
| `/vs/ynab` | "YNAB alternative free", "YNAB vs", "free budget app like YNAB" |
| `/vs/monarch` | "Monarch Money alternative", "Monarch Money free alternative" |
| `/vs/copilot` | "Copilot Money alternative", "Copilot Money Android" |
| `/vs/rocket-money` | "Rocket Money alternative free", "Rocket Money without fees" |
| `/vs/lunch-money` | "Lunch Money alternative", "Lunch Money free" |
| `/vs/mint` | "Mint replacement", "Mint alternative 2026", "best app after Mint" |

### Blog Post Ideas (SEO-Optimized)

**High Priority (write first):**
1. "Best Free Personal Finance Apps in 2026 — Complete Guide"
2. "YNAB vs MoneyStyle: Why I Switched to a Free Alternative"
3. "How AI Receipt Scanning Works — Save Hours of Manual Entry"
4. "How to Budget as a Couple — Free Tools and Tips"
5. "Track Your Spending on Google Maps — Money Map Feature"

**Medium Priority:**
6. "Voice Transactions: Log Expenses by Talking to Your Phone"
7. "Financial Gamification: How Challenges Help You Save More"
8. "Building a Personal Finance App with Next.js 16 and GPT-4"
9. "Multi-Currency Expense Tracking for Digital Nomads"
10. "Smart Shopping: How to Compare Prices Across Stores"

### SEO Checklist for Each Blog Post
- [ ] Target keyword in title, H1, first paragraph
- [ ] Meta description with keyword (under 160 chars)
- [ ] 2-3 internal links to feature pages
- [ ] At least 1 image/screenshot
- [ ] 800-1500 words
- [ ] CTA at the end: "Try MoneyStyle free"

---

## 8. Developer Communities

### Dev.to
**URL:** https://dev.to

**Article Template:**
```
Title: How I Built a Full-Stack Finance App with Next.js 16, Prisma, and AI

Tags: nextjs, typescript, ai, webdev

Content:
- Why I built it (YNAB was too expensive)
- Architecture diagram (from your docs)
- Key technical decisions
- AI integration (Whisper + GPT-4)
- Google Maps integration
- Challenges and lessons learned
- Link to try it

Include code snippets from:
- Server Actions pattern
- Voice transaction API route
- Google Maps location picker
```

### Hashnode
**URL:** https://hashnode.com

Same article, republished with canonical URL pointing to Dev.to

### GitHub
- Make the architecture/tech stack documentation public (README)
- Add "Built with MoneyStyle" badge idea
- Star-worthy README with screenshots

---

## 9. Listing Sites

Submit MoneyStyle to these directories:

| Site | URL | Priority | Notes |
|------|-----|----------|-------|
| **Product Hunt** | producthunt.com | 🔴 High | Launch day feature |
| **AlternativeTo** | alternativeto.net | 🔴 High | List as alternative to YNAB, Mint, Monarch |
| **SaaSHub** | saashub.com | 🟠 Medium | Free listing |
| **BetaList** | betalist.com | 🟠 Medium | For early-stage startups |
| **There's An AI For That** | theresanaiforthat.com | 🟠 Medium | AI-focused directory |
| **Futurepedia** | futurepedia.io | 🟠 Medium | AI tools directory |
| **ToolPilot** | toolpilot.ai | 🟡 Low | AI tools |
| **Uneed** | uneed.best | 🟡 Low | Startup directory |
| **Launching Next** | launchingnext.com | 🟡 Low | Startup launch platform |
| **StartupBase** | startupbase.io | 🟡 Low | Startup directory |
| **Ben's Bites** | bensbites.com | 🟡 Low | AI newsletter — submit for feature |

### AlternativeTo Listing (Do This Today)
1. Go to https://alternativeto.net/software/moneystyle/
2. If not listed, click "Add Application"
3. Fill in:
   - Name: MoneyStyle
   - URL: moneystyle.app
   - Description: Free personal finance tracker with 30+ features including AI receipt scanning, voice transactions, and Google Maps spending visualization.
   - Tags: Personal Finance, Budgeting, Expense Tracker, AI
   - Alternatives to: YNAB, Mint, Monarch Money, Copilot Money, Rocket Money
   - Platforms: Web
   - Pricing: Free

---

## 10. Telegram & MENA Market

### Telegram Channels to Share In
- Iranian tech/startup groups
- Dubai expat groups
- UAE finance groups
- Persian developer groups

### Message Template (Persian)
```
سلام! یه اپ مدیریت مالی رایگان ساختم با ربات تلگرام.

فقط بنویسید "50 food" تو ربات → تراکنش ثبت میشه.

فیچرها:
- ثبت هزینه با پیام تلگرام
- اسکن رسید با AI
- ثبت صوتی (فارسی و انگلیسی)
- نمایش خرج‌ها روی نقشه
- بودجه‌بندی و پس‌انداز

رایگانه: moneystyle.app
ربات تلگرام: @moneystyle_app_bot
```

### Message Template (English — UAE/Dubai groups)
```
Hey! I built a free finance tracker perfect for the UAE 🇦🇪

- Multi-currency (AED, USD, EUR...)
- Telegram bot: type "50 food" → expense logged
- AI receipt scanning
- Voice transactions in English & Arabic
- See spending on Google Maps
- 100% free, no ads

Try it: moneystyle.app
Telegram bot: @moneystyle_app_bot
```

---

## 11. YouTube

### Video Ideas

**Launch Video (Priority 1):**
```
Title: MoneyStyle — Free Finance App with 30+ Features (Full Demo)
Length: 3-5 minutes
Structure:
0:00 - Problem (finance apps are expensive)
0:30 - MoneyStyle intro
1:00 - Dashboard walkthrough
1:30 - Adding transactions (manual + voice + receipt scan)
2:30 - Money Map (Google Maps)
3:00 - AI features (Wealth Pilot, Meal Planner)
3:30 - Telegram bot demo
4:00 - Pricing (free!) + CTA
```

**Technical Video (Developer audience):**
```
Title: Building a Full-Stack Finance App with Next.js 16, Prisma, and GPT-4
Length: 10-15 minutes
Cover: Architecture, Server Actions, AI integration, Google Maps
```

**Short-Form (TikTok/Reels/Shorts):**
```
- "This free app replaces YNAB" (30 sec)
- "Log expenses with your voice" (15 sec)
- "See your spending on Google Maps" (15 sec)
- "AI scans your receipts" (15 sec)
```

---

## 12. Auto-Promote Platforms (Submit Once, They Promote For You)

These platforms promote your product to their audience — you just submit and they do the rest.

### 🔴 Highest Impact (Submit First)

| # | Platform | URL | Audience | Cost | What They Do |
|---|----------|-----|----------|------|-------------|
| 1 | **Product Hunt** | producthunt.com | 1M+ users | Free | Featured on homepage, newsletter, badge |
| 2 | **AlternativeTo** | alternativeto.net | High SEO traffic | Free | Shows MoneyStyle when users search YNAB/Mint |
| 3 | **There's An AI For That** | theresanaiforthat.com | 5M monthly visitors | Free | Listed in AI tools directory |
| 4 | **Futurepedia** | futurepedia.io | 3M+ monthly | Free | AI tools newsletter + listing |
| 5 | **SaaSHub** | saashub.com | High SEO | Free | Listed alongside competitors |

### 🟠 Newsletters & Media (They Write About You)

| # | Platform | URL | Subscribers | Cost | How |
|---|----------|-----|------------|------|-----|
| 6 | **Ben's Bites** | bensbites.com/submit | 500K+ | Free | Submit form → they feature AI tools |
| 7 | **TLDR Newsletter** | tldr.tech/submit | 1M+ | Free | Submit form → featured in daily email |
| 8 | **Console.dev** | console.dev | 50K+ devs | Free | Submit → weekly developer tools roundup |
| 9 | **Uneed** | uneed.best | 30K+ | Free | Submit → vote system like Product Hunt |
| 10 | **BetaList** | betalist.com | 60K+ | Free (2 week queue) or $129 instant | Email blast to early adopter subscribers |

### 🟡 Directories (Submit Once, Permanent Listing)

| # | Platform | URL | Cost | Notes |
|---|----------|-----|------|-------|
| 11 | **AppSumo Marketplace** | appsumo.com/partners | Free | Can run lifetime deals |
| 12 | **GetApp** | getapp.com | Free | Gartner-owned, high trust |
| 13 | **G2** | g2.com | Free | Enterprise review platform |
| 14 | **Capterra** | capterra.com | Free | High SEO for "best X software" |
| 15 | **ToolPilot** | toolpilot.ai | Free | AI tools directory |
| 16 | **TopAI.tools** | topai.tools | Free | AI tools directory |
| 17 | **AI Tool Directory** | aitoolsdirectory.com | Free | Curated AI tools |
| 18 | **StartupBase** | startupbase.io | Free | Startup directory |
| 19 | **Launching Next** | launchingnext.com | Free | Startup launch platform |
| 20 | **MicroLaunch** | microlaunch.net | Free | Indie maker launches |
| 21 | **Fazier** | fazier.com | Free | Product launch platform |

### Submit Info Template (Copy-Paste for All Platforms)

```
Name: MoneyStyle
URL: https://moneystyle.app
Tagline: 100% free AI-powered personal finance tracker with 30+ features
Category: Personal Finance / Budgeting / AI Tools

Description (short):
Free personal finance tracker with AI receipt scanning, voice transactions,
Google Maps spending, budget rollover, household sharing, and 25+ more features.
No subscriptions, no ads.

Description (long):
MoneyStyle is a 100% free personal finance tracker that gives you premium
features without the premium price. While apps like YNAB ($180/yr) and
Monarch ($100/yr) lock features behind subscriptions, MoneyStyle offers
30+ features completely free:

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

AI features use your own OpenAI API key (~$0.01 per action).
Built with Next.js 16, TypeScript, PostgreSQL, and GPT-4.

Pricing: Free
Platforms: Web (PWA)
Alternatives to: YNAB, Mint, Monarch Money, Copilot Money, Rocket Money, Lunch Money
Tags: personal finance, budgeting, expense tracker, AI, receipt scanning, free
Founder: Sina Ghadri
```

### Submission Checklist

- [ ] Product Hunt — submit (wait for best Tuesday/Wednesday)
- [ ] AlternativeTo — list as alternative to YNAB, Mint, Monarch
- [ ] There's An AI For That — submit via form
- [ ] Futurepedia — submit via form
- [ ] SaaSHub — submit via form
- [ ] Ben's Bites — submit via bensbites.com/submit
- [ ] TLDR — submit via tldr.tech/submit
- [ ] Console.dev — submit via website
- [ ] Uneed — submit and ask friends to upvote
- [ ] BetaList — submit (free queue or paid instant)
- [ ] GetApp — create vendor profile
- [ ] G2 — create product listing
- [ ] Capterra — create vendor profile
- [ ] ToolPilot — submit via form
- [ ] TopAI.tools — submit via form
- [ ] StartupBase — submit via form
- [ ] Launching Next — submit via form
- [ ] MicroLaunch — submit via form
- [ ] Fazier — submit via form

---

## 13. Paid Channels

### Google Ads — Complete Guide

**How It Works:**
You pay → when someone searches a specific keyword on Google → your ad shows at the top → they click → you pay per click (CPC). You set a daily budget cap — Google never exceeds it. No contracts, pause/stop anytime.

**Setup Steps:**
1. Go to https://ads.google.com and sign in
2. Create Campaign → Goal: "Website traffic" → Type: "Search"
3. Set keywords (see table below)
4. Set daily budget ($5 to start)
5. Write ad copy
6. Set landing page URL
7. Enable conversion tracking (connect Google Analytics)

**Best Keywords for MoneyStyle:**

| Keyword | Competition | CPC Estimate | Landing Page |
|---------|------------|-------------|-------------|
| "free budget app" | Medium | $0.50 | `/` |
| "YNAB alternative free" | Low | $0.30 | `/vs/ynab` |
| "Mint replacement" | Medium | $0.80 | `/vs/mint` |
| "expense tracker free" | Medium | $0.60 | `/` |
| "AI receipt scanner app" | Low | $0.40 | `/features/receipt-scanner` |
| "personal finance app free" | High | $1.50 | `/` |
| "Monarch Money free alternative" | Low | $0.30 | `/vs/monarch` |
| "voice expense tracker" | Low | $0.40 | `/features/transaction-tracking` |
| "spending map app" | Low | $0.30 | `/money-map` |
| "free budget app like YNAB" | Low | $0.30 | `/vs/ynab` |

**Ad Copy Templates:**

```
Ad 1 (General):
  Headline 1: Free Personal Finance Tracker
  Headline 2: 30+ Features — No Subscription
  Headline 3: AI Receipt Scanning & Voice Input
  Description: Track expenses, budget with rollover, see spending on Google Maps.
               100% free. Try MoneyStyle today.
  URL: moneystyle.app

Ad 2 (YNAB alternative):
  Headline 1: Free YNAB Alternative
  Headline 2: Same Features, $0 Price
  Headline 3: Budget Rollover + AI Features
  Description: Everything YNAB does, plus AI receipt scanning, voice transactions,
               and Google Maps. 100% free.
  URL: moneystyle.app/vs/ynab

Ad 3 (AI-focused):
  Headline 1: AI-Powered Expense Tracker
  Headline 2: Scan Receipts, Log by Voice
  Headline 3: 100% Free — No Subscription
  Description: Snap a receipt, AI extracts items. Say "50 coffee" and it's logged.
               30+ features, completely free.
  URL: moneystyle.app/features/receipt-scanner
```

**Budget Scenarios:**

| Level | Daily | Monthly | Clicks/Month | Signups (~10% conversion) |
|-------|-------|---------|-------------|--------------------------|
| Test | $3 | ~$90 | 90-180 | 9-18 |
| Start | $5 | ~$150 | 150-300 | 15-30 |
| Growth | $10 | ~$300 | 300-600 | 30-60 |
| Serious | $20 | ~$600 | 600-1200 | 60-120 |

**Recommendation:** Start with **$5/day**. After 1 week, check which keywords brought the most signups → increase budget on those, pause the rest.

**Negative Keywords (exclude these):**
```
download, android, ios, APK, app store, play store, desktop app, windows, mac app
```

**Targeting Settings:**
- Locations: UAE, US, UK, Canada, Australia
- Language: English
- Schedule: 8 AM - 10 PM (local time)
- Devices: All (mobile + desktop)

**Important Tips:**
- Connect Google Analytics for conversion tracking (signups)
- Check "Search Terms" report weekly — add irrelevant searches to negative keywords
- Use comparison pages (`/vs/ynab`) as landing pages for competitor keywords
- Increase budget only on keywords with >5% conversion rate

### Reddit Ads (Start Week 3)

```
Platform: https://ads.reddit.com
Target: r/personalfinance, r/ynab, r/budgeting, r/frugal
Budget: $5/day
Format: Promoted post (looks like regular Reddit post)
Copy: Same as Reddit post template from Section 3
Landing: moneystyle.app
```

**Reddit Ads Tips:**
- Promoted posts look native — less "ad feeling"
- Target specific subreddits, not broad interests
- Use casual tone, not corporate
- Best CPC: $0.30-0.80

### Other Cheap Ad Platforms

| Platform | CPC | Setup URL | Best For |
|----------|-----|-----------|---------|
| **Facebook/Instagram** | $0.10-0.30 | ads.meta.com | Cheapest CPC, broad awareness |
| **Quora Ads** | $0.30-0.80 | quora.com/business | High-intent Q&A readers |
| **Microsoft/Bing Ads** | $0.30-0.80 | ads.microsoft.com | Same as Google but 30-50% cheaper |
| **Twitter/X Ads** | $0.25-0.50 | ads.x.com | Promote launch threads |
| **Reddit Ads** | $0.20-0.50 | ads.reddit.com | Targeted subreddits |
| **Google Ads** | $0.50-1.50 | ads.google.com | Highest intent but most expensive |

### Recommended Low-Budget Plan ($3/day = $90/month)

| Channel | Daily | Monthly | Clicks/Month | Why |
|---------|-------|---------|-------------|-----|
| Facebook/Instagram | $2 | ~$60 | 200-600 | Cheapest CPC, biggest reach |
| Microsoft/Bing Ads | $1 | ~$30 | 30-75 | Google keywords without Google prices |
| **Total** | **$3** | **~$90** | **230-675** | **~23-67 signups/month** |

### Medium Budget Plan ($5/day = $150/month)

| Channel | Daily | Monthly | Clicks/Month |
|---------|-------|---------|-------------|
| Facebook/Instagram | $2 | ~$60 | 200-600 |
| Google Ads | $2 | ~$60 | 40-120 |
| Bing Ads | $1 | ~$30 | 30-75 |
| **Total** | **$5** | **~$150** | **270-795** |

### Growth Budget Plan ($10/day = $300/month)

| Channel | Daily | Monthly | Clicks/Month |
|---------|-------|---------|-------------|
| Facebook/Instagram | $4 | ~$120 | 400-1200 |
| Google Ads | $3 | ~$90 | 60-200 |
| Bing Ads | $2 | ~$60 | 60-150 |
| Reddit Ads | $1 | ~$30 | 30-60 |
| **Total** | **$10** | **~$300** | **550-1610** |

### Key Insight
Facebook/Instagram is **5x cheaper** per click than Google. Start there. Use Google only for high-intent keywords ("YNAB alternative free") where people are actively looking for a solution.

All free submit platforms (Section 12) should be done **before** any paid ads — they bring traffic at $0.

---

## 14. Ready-to-Use Copy

### One-Liners
```
Short: "Free personal finance tracker with 30+ features and AI."
Medium: "MoneyStyle — track expenses, scan receipts, log by voice, and see spending on Google Maps. 100% free."
Long: "MoneyStyle is a free personal finance tracker with 30+ features including AI receipt scanning, voice transactions, Google Maps spending visualization, budget rollover, household sharing, financial challenges, and a Telegram bot. No subscriptions, no ads."
```

### Elevator Pitch
```
"YNAB charges $15/month. Monarch charges $100/year. MoneyStyle gives you more features than both — for free.

We have AI receipt scanning, voice transactions, spending on Google Maps, meal planning, financial challenges, and even a Telegram bot.

The business model is simple: AI features use your own OpenAI key at ~$0.01 per action. Everything else is completely free."
```

### Call to Action Variants
```
1. "Try MoneyStyle free at moneystyle.app"
2. "Start tracking your money for free — moneystyle.app"
3. "30+ features, $0 price. moneystyle.app"
4. "Your finances, AI-powered, free forever. moneystyle.app"
```

### Feature Highlights (for social posts)
```
🤖 AI Receipt Scanner — snap, scan, done
🎤 Voice Transactions — "50 dirhams coffee"
🗺️ Money Map — spending on Google Maps
📊 Budget Rollover — YNAB-style budgeting, free
🏆 Financial Challenges — gamify your savings
👨‍👩‍👧 Household Sharing — budget as a family
💬 Telegram Bot — log expenses from chat
📱 PWA — install on any device
🔑 Developer API — build on top of MoneyStyle
```

---

## 15. Weekly Schedule

### Week 1: Launch
| Day | Action |
|-----|--------|
| Mon | Final checks, prepare all assets, schedule posts |
| Tue | **Product Hunt launch** + Twitter thread + LinkedIn post |
| Wed | Hacker News "Show HN" + Reddit r/SideProject |
| Thu | Reddit r/ynab + Dev.to article |
| Fri | AlternativeTo listing + other directories |
| Sat | Respond to all comments, collect feedback |
| Sun | Write first blog post based on feedback |

### Week 2: Content
| Day | Action |
|-----|--------|
| Mon | Publish blog: "Best Free Finance Apps 2026" |
| Wed | Reddit r/personalfinance (helpful comment with link) |
| Thu | Twitter feature spotlight |
| Fri | Start Google Ads ($5/day) |
| Sat | Publish blog: "YNAB vs MoneyStyle" |

### Week 3: Expansion
| Day | Action |
|-----|--------|
| Mon | Telegram group outreach (UAE/Iran) |
| Wed | LinkedIn post (Persian) |
| Thu | YouTube demo video upload |
| Fri | Reddit r/selfhosted |
| Sat | Start Reddit Ads ($5/day) |

### Week 4: Optimize
| Day | Action |
|-----|--------|
| Mon | Analyze Google Analytics — which channels work |
| Tue | Double down on best-performing channel |
| Wed | Write 2 more blog posts |
| Thu | Engage with Product Hunt community |
| Fri | Review ad performance, optimize keywords |
| Sat | Plan Month 2 strategy |

---

## 16. KPIs & Tracking

### Metrics to Track Weekly

| Metric | Tool | Goal (Month 1) |
|--------|------|----------------|
| Website visits | Google Analytics | 5,000+ |
| Sign-ups | Database query | 200+ |
| Active users (weekly) | Analytics events | 50+ |
| Product Hunt upvotes | Product Hunt | 100+ |
| Reddit post karma | Reddit | 100+ per post |
| Twitter followers | Twitter | 200+ |
| Blog page views | Google Analytics | 1,000+ |
| Google Search impressions | Search Console | 5,000+ |
| Comparison page visits | Google Analytics | 500+ |

### How to Track
```
- Google Analytics: GA4 already configured (G-9XG7N1K1H2)
- Microsoft Clarity: Session recordings (vy5ip6fwu0)
- Google Search Console: Already verified
- UTM links for campaigns:
  moneystyle.app?utm_source=reddit&utm_medium=post&utm_campaign=launch
  moneystyle.app?utm_source=producthunt&utm_medium=launch
  moneystyle.app?utm_source=twitter&utm_medium=thread
```

---

*MoneyStyle Marketing Playbook v1.0 — March 2026*
