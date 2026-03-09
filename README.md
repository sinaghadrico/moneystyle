# MoneyStyle — AI-Powered Personal Finance Tracker

**Domain:** moneystyle.app
**Brand:** Emerald gradient (#10b981 → #14b8a6)

A full-stack, multi-user personal finance platform with AI-powered insights, receipt scanning, wealth planning, and Telegram/SMS integrations. Built mobile-first as a PWA.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Server Actions, Turbopack) |
| **Language** | TypeScript 5 (strict) |
| **Database** | PostgreSQL 16 + Prisma ORM 6 |
| **UI** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Charts** | Recharts |
| **Auth** | NextAuth.js v5 (JWT sessions) |
| **AI** | OpenAI GPT-4 |
| **Storage** | MinIO / AWS S3 |
| **PWA** | Serwist (service worker) |
| **Bot** | Telegram Bot API (webhook) |
| **Validation** | Zod |
| **Runtime** | Node.js 22, pnpm |
| **Deploy** | Docker + Docker Compose |

---

## Features Overview

### Core Finance
- **Dashboard** — Income/expense charts, category breakdown, merchant analysis, spending heatmap, budget progress, expense predictions, savings goals, debt summary
- **Transactions** — Full CRUD with filtering (date, category, account, type, merchant, tags, amount range, source), sorting, pagination, swipeable mobile cards
- **Split Transactions** — Divide expenses among categories or persons with settlement tracking
- **Receipt Scanning** — AI extracts line items (quantity, price, merchant) from receipt photos
- **Transaction Merging** — AI detects duplicates, guided merge workflow
- **Bulk Import** — CSV/Excel upload with column mapping
- **Tags** — Custom color-coded tags for transactions

### Smart Money
- **Price Analysis** — Track item prices across merchants, find cheapest stores, view price trends
- **Smart Shopping** — Build shopping lists, compare total cost across stores, AI split strategy for maximum savings
- **Budget Management** — Per-category monthly limits with alert thresholds (80%)
- **Auto-Categorization** — Learn from merchant patterns, configurable rules

### AI Features (9 Prompts)
| Feature | Description |
|---------|-------------|
| **Receipt Parser** | Extract line items from receipt images |
| **Money Chat** | Conversational financial Q&A with access to user data |
| **Wealth Pilot** | Comprehensive wealth score (0-100), 1/3/5-year projections, actionable plans |
| **Bill Negotiator** | Analyze bills/subscriptions, find savings opportunities with step-by-step actions |
| **Money Advice** | Personalized financial tips based on spending patterns |
| **Meal Planner** | Weekly meal plans with ingredients |
| **Weekend Planner** | Budget/Balanced/Premium activity plans based on location & preferences |
| **Item Normalizer** | Group similar product names for price analysis |
| **Weekend Item Swap** | Replace single activity/food in a plan |

All AI prompts are user-customizable via Settings.

### Profile & Planning
- **Income Sources** — Track salary, freelance, deposits with expected dates
- **Bills** — Recurring bills with due dates, reminders, payment history
- **Installments** — Loan/payment plan tracking with progress (5/12 payments)
- **Reserves** — Cash, gold, crypto holdings with value history
- **Savings Goals** — Target amount, deadline, visual progress
- **Cashflow Calendar** — Monthly view combining income, expenses, bills, installments, reserves with projected balance

### Lifestyle
- **Weekend Planner** — AI plans with activities, restaurants, timing, map links. Link actual transactions to compare estimated vs actual spend
- **Meal Planner** — AI-generated meal plans with ingredients
- **Shopping Baskets** — Smart shopping lists with price analysis integration

### Integrations
- **Telegram Bot** — Quick transaction entry, deletion, stats, monthly reports, budget alerts, anomaly detection. Supports Persian numerals
- **Telegram Mini-App** — Full app embedded in Telegram
- **SMS Parsing** — Auto-create transactions from bank SMS (custom regex patterns)
- **Notifications** — Payment reminders, budget alerts, monthly reports, weekend plan reminders (via Telegram)

### Other
- **Year Wrapped** — Monthly spending summaries with slideshow (biggest expense, favorite merchant, streaks, fun facts)
- **Multi-Currency** — Multiple currencies with exchange rate management
- **Dark Mode** — System/light/dark theme
- **PWA** — Installable, offline-capable, pull-to-refresh
- **Anomaly Detection** — Alerts for unusual transactions

---

## Authentication

4 providers via NextAuth.js v5 (JWT strategy):

| Provider | Method |
|----------|--------|
| **Google** | OAuth |
| **GitHub** | OAuth |
| **Email/Password** | Credentials (bcryptjs) |
| **Telegram** | Login Widget + Mini-App |

On first login, `seedNewUser()` creates a default "Cash" account and 15 default categories.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Protected routes (require auth)
│   │   ├── dashboard/            # Main dashboard
│   │   ├── transactions/         # Transaction list
│   │   │   ├── manage/           # Accounts, Categories, Persons tabs
│   │   │   ├── merge/            # Duplicate merge workflow
│   │   │   └── prices/           # Price analysis
│   │   ├── profile/              # Finance profile
│   │   │   ├── income/           # Income sources
│   │   │   ├── cashflow/         # Cashflow calendar
│   │   │   ├── payments/         # Bills & installments
│   │   │   ├── goals/            # Savings goals
│   │   │   └── personal/         # User profile
│   │   ├── wealth/               # Wealth Pilot (AI)
│   │   ├── chat/                 # Money Chat (AI)
│   │   ├── lifestyle/            # Lifestyle hub
│   │   │   ├── weekend/          # Weekend planner
│   │   │   ├── meals/            # Meal planner
│   │   │   ├── shopping/         # Smart shopping
│   │   │   ├── negotiate/        # Bill negotiator
│   │   │   └── advice/           # Money advice
│   │   ├── persons/[id]/summary/ # Person debt summary
│   │   ├── settings/             # App settings
│   │   │   ├── integrations/     # Telegram, SMS, AI config
│   │   │   ├── transactions/     # Export, auto-categorize
│   │   │   └── advanced/         # Currency, developer
│   │   └── pricing/              # Pricing page
│   │
│   ├── (auth)/                   # Public auth routes
│   │   └── auth/
│   │       ├── login/
│   │       ├── register/
│   │       ├── telegram-miniapp/
│   │       └── error/
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── parse-receipt/        # AI receipt parsing
│   │   ├── upload/               # File upload (MinIO)
│   │   ├── upload/avatar/        # Avatar upload
│   │   ├── media/[...path]/      # Serve media files
│   │   ├── sms/                  # SMS webhook
│   │   ├── telegram/             # Telegram webhook
│   │   └── cron/
│   │       ├── installment-reminders/
│   │       ├── monthly-report/
│   │       └── weekend-reminder/
│   │
│   ├── features/                 # Marketing feature pages
│   │   ├── [slug]/
│   │   └── smart-shopping/
│   │
│   ├── opengraph-image.tsx       # Dynamic OG image
│   ├── twitter-image.tsx         # Dynamic Twitter card
│   ├── sw.ts                     # Service worker (Serwist)
│   └── page.tsx                  # Landing page
│
├── actions/                      # Server Actions (22 files)
│   ├── transactions.ts           # Transaction CRUD + queries
│   ├── dashboard.ts              # Dashboard stats & charts
│   ├── accounts.ts               # Account management
│   ├── categories.ts             # Category management
│   ├── persons.ts                # Person & settlement management
│   ├── merge.ts                  # Transaction merge logic
│   ├── price-analysis.ts         # Price comparison
│   ├── shopping-basket.ts        # Shopping list & store comparison
│   ├── ai.ts                     # Receipt parsing
│   ├── bulk-import.ts            # CSV/Excel import
│   ├── money-chat.ts             # AI chat sessions
│   ├── wealth-pilot.ts           # Wealth plan generation
│   ├── profile.ts                # Profile data
│   ├── savings.ts                # Savings goals
│   ├── budgets.ts                # Budget management
│   ├── currencies.ts             # Currency management
│   ├── meal-planner.ts           # Meal plan generation
│   ├── weekend-planner.ts        # Weekend plan generation
│   ├── settings.ts               # App settings
│   ├── tags.ts                   # Tag management
│   ├── wrapped.ts                # Year Wrapped data
│   └── auth.ts                   # User registration
│
├── components/
│   ├── ui/                       # shadcn/ui base (button, dialog, drawer, card, etc.)
│   ├── layout/                   # Sidebar, BottomNav (mobile), Header
│   ├── dashboard/                # Stats cards, charts, heatmap, predictions, wrapped slides
│   ├── transactions/             # List, add/edit dialogs, split, items, media viewer, bulk import, filters
│   ├── accounts/                 # Account forms & dialogs
│   ├── categories/               # Category forms & dialogs
│   ├── persons/                  # Person forms, summary content
│   ├── merge/                    # Merge suggestions workflow
│   ├── price-analysis/           # Price charts, item details, shopping baskets, group forms
│   ├── profile/                  # Income, bills, installments, reserves, cashflow calendar
│   ├── savings/                  # Savings goal forms
│   ├── budgets/                  # Budget forms
│   ├── wealth/                   # Wealth Pilot content
│   ├── chat/                     # Money Chat content
│   ├── lifestyle/                # Lifestyle tabs, shopping baskets, profile completeness
│   ├── meal-planner/             # Meal planner content
│   ├── weekend-planner/          # Weekend planner content, spending comparison
│   ├── settings/                 # Settings tabs, AI prompts, SMS patterns, currencies, notifications
│   ├── auth/                     # Login/register forms, social buttons, Telegram login
│   ├── landing/                  # Landing page content
│   ├── features/                 # Feature landing pages
│   └── pricing/                  # Pricing content
│
├── lib/
│   ├── auth.ts                   # NextAuth config (providers, callbacks, adapter)
│   ├── auth-utils.ts             # Auth helper functions
│   ├── db.ts                     # Prisma client singleton
│   ├── types.ts                  # TypeScript types (90+)
│   ├── validators.ts             # Zod schemas
│   ├── utils.ts                  # Formatting helpers (currency, dates)
│   ├── constants.ts              # App constants
│   ├── ai-prompts.ts             # 9 AI prompt templates
│   ├── telegram.ts               # Telegram bot API wrapper
│   ├── telegram-auth.ts          # Telegram login/mini-app validation
│   ├── sms-parser.ts             # Bank SMS regex parsing
│   ├── storage.ts                # MinIO/S3 file operations
│   ├── currency.ts               # Currency conversion
│   ├── auto-categorize.ts        # Merchant → Category mapping
│   ├── anomaly.ts                # Unusual transaction detection
│   ├── item-normalization.ts     # Product name grouping
│   ├── spread-utils.ts           # Expense spreading across months
│   ├── feature-data.ts           # Feature metadata
│   ├── feature-info-content.ts   # Feature descriptions for UI
│   ├── app-config.ts             # App name, description, tagline
│   ├── notification-templates.ts # Notification formats
│   └── bulk-import-types.ts      # Import type definitions
│
├── hooks/
│   ├── use-debounce.ts           # Debounce values
│   ├── use-media-query.ts        # Responsive breakpoints
│   ├── use-animated-counter.ts   # Animated number display
│   ├── use-in-view.ts            # Intersection observer
│   ├── use-pull-to-refresh.ts    # Mobile pull-to-refresh
│   └── use-telegram-auto-auth.ts # Telegram mini-app auto-login
│
prisma/
├── schema.prisma                 # 31 database models
├── seed.ts                       # Seed script
└── migrations/                   # 26 migrations

scripts/
├── deploy.sh                     # SSH deploy to EC2
├── up.sh                         # Start Docker environment
├── down.sh                       # Stop Docker environment
├── sync-db.sh                    # Sync remote DB to local
├── setup-telegram-webhook.ts     # Configure Telegram webhook
└── import-sina-mashreq.ts        # CSV/JSON import script
```

---

## Database Schema (31 Models)

### Auth
- **User** — Main user entity (30+ relations)
- **OAuthAccount** — Google/GitHub OAuth links
- **Session** / **VerificationToken** — JWT sessions

### Financial Core
- **Transaction** — date, time, amount, currency, type (income/expense/transfer/other), category, account, merchant, description, source (web/sms/telegram), media files, merge support
- **Account** — Bank/cash/wallet accounts (name, type, bank, color)
- **Category** — Expense categories (name, color, icon, budget)
- **Budget** — Per-category monthly limits with alert thresholds
- **Tag** / **TransactionTag** — Custom tags with color coding
- **TransactionItem** — Receipt line items (name, quantity, unit price)
- **TransactionSplit** — Split by category or person
- **ItemGroup** — Canonical item names for price analysis

### Income & Reserves
- **IncomeSource** / **IncomeDeposit** — Recurring income tracking
- **Reserve** / **ReserveSnapshot** — Cash/gold/crypto holdings with history

### Payments
- **Bill** / **BillPayment** — Recurring bills with due dates
- **Installment** / **InstallmentPayment** — Loan/payment plan tracking
- **Settlement** — Debt settlements with persons

### People
- **Person** — People in shared expenses
- **MerchantCategoryRule** — Auto-categorize by merchant

### Shopping
- **ShoppingList** / **ShoppingListItem** — Shopping lists with price analysis

### AI & Lifestyle
- **MealPlan** — Weekly meal plans (JSON)
- **WeekendPlan** — Activity plans (JSON)
- **UserPreference** — Likes, dislikes, location, companion type
- **MoneyAdvice** — Financial advice results (JSON)
- **WealthPlan** — Wealth Pilot results (JSON)
- **BillNegotiation** — Bill reduction suggestions (JSON)
- **ChatSession** — Money Chat conversations (JSON)

### Config
- **AiPrompt** — Custom AI system prompts per user
- **NotificationTemplate** — Notification message formats
- **SmsPattern** — Bank SMS parsing rules (regex)
- **AppSettings** — User preferences (currency, theme, defaults)
- **Currency** — Supported currencies with exchange rates

---

## Telegram Bot

### Transaction Messages

```
[+]amount merchant [#category] [@account]
```

| Part | Required | Description |
|------|----------|-------------|
| `amount` | Yes | Number. `+` prefix = income, no prefix = expense |
| `merchant` | No | First word(s) after amount |
| `#category` | No | Fuzzy-matches existing category |
| `@account` | No | Fuzzy-matches account. Default: first account |
| Next line | No | Description |

Persian numerals (۰-۹) supported.

**Examples:**
```
250 Carrefour #grocery
+15000 Salary #income @mashreq
350 کارفور #grocery
```

### Commands

| Command | Description |
|---------|-------------|
| `del <id>` | Delete by short ID |
| `del last [n]` | Delete last N transactions |
| `stats` | Current month report |
| `stats last` | Previous month |
| `stats 2026-01` | Specific month |
| `حذف` / `آمار` / `گزارش` | Persian keywords |

---

## Cron Jobs

| Route | Schedule | Purpose |
|-------|----------|---------|
| `GET /api/cron/installment-reminders` | Daily | Payment due date reminders |
| `GET /api/cron/monthly-report` | 1st of month | Monthly summary via Telegram |
| `GET /api/cron/weekend-reminder` | Friday evening | Weekend plan notification |

Triggered by external scheduler (GitHub Actions, EasyCron, etc.).

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"
DIRECT_URL="postgresql://user:pass@host:port/db"

# Auth
AUTH_SECRET="random-secret"
NEXTAUTH_URL="http://localhost:3020"
NEXT_PUBLIC_APP_URL="https://moneystyle.app"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

# AI
OPENAI_API_KEY="sk-..."

# Telegram
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_WEBHOOK_SECRET="..."
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="..."

# Storage (MinIO / S3)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="..."
MINIO_SECRET_KEY="..."
MINIO_BUCKET="transaction-media"
MINIO_USE_SSL="false"

# SMS
SMS_API_KEY="..."

# Admin (seed)
ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."
```

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 22+](https://nodejs.org/) and [pnpm](https://pnpm.io/)

### 1. Clone & Install

```bash
git clone <repo-url>
cd revenue
pnpm install
```

### 2. Environment Variables

Copy and configure `.env` (see section above).

### 3. Start Database & Storage

```bash
docker compose up db minio -d
```

### 4. Run Migrations

```bash
pnpm db:migrate
```

### 5. Start Dev Server

```bash
pnpm dev
```

App runs at [http://localhost:3020](http://localhost:3020).

---

## Docker Deployment

```bash
# Full stack
docker compose up -d

# First-time seed
docker compose --profile seed up seed
```

| Service | Description | Port |
|---------|-------------|------|
| `db` | PostgreSQL 16 Alpine | 5434 |
| `minio` | S3-compatible storage | 9000, 9001 |
| `app` | Next.js production | 3020 |
| `seed` | Migration + seed (one-time) | - |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `pnpm dev` | Start development server (port 3020) |
| Build | `pnpm build` | Generate Prisma + migrate + build |
| Start | `pnpm start` | Run production build |
| Lint | `pnpm lint` | Run ESLint |
| Migrate | `pnpm db:migrate` | Run Prisma migrations |
| Seed | `pnpm db:seed` | Seed database |
| Studio | `pnpm db:studio` | Open Prisma Studio GUI |
| Deploy | `./scripts/deploy.sh` | SSH deploy to EC2 |
| Start all | `./scripts/up.sh` | Docker + server + tunnel |
| Stop all | `./scripts/down.sh` | Stop everything |
| Sync DB | `./scripts/sync-db.sh` | Sync remote DB to local |
| Webhook | `npx tsx scripts/setup-telegram-webhook.ts <url>` | Set Telegram webhook |

---

## UI Patterns

- **ResponsiveDialog** — Dialog on desktop, Drawer on mobile
- **Dialog footers** — 50/50 side-by-side buttons (`flex w-full gap-2` + `flex-1`)
- **Mobile tab bars** — Icon on top, label below (`flex-col items-center gap-1`)
- **Delete confirmation** — `deleteConfirm` state + ResponsiveDialog with destructive button
- **Card layout (mobile)** — Stacked rows, action icons bottom-right
- **Swipeable cards** — Swipe left for edit/delete/media actions (mobile)
- **Toast notifications** — Sonner for all user feedback

---

## Architecture Notes

- **Proxy (formerly Middleware)** — `src/proxy.ts` handles auth redirects. Public paths bypass auth. Uses `auth()` from NextAuth to check sessions.
- **Server Actions** — All mutations go through `src/actions/`. Each action validates auth via `requireAuth()`.
- **Multi-user** — All models have `userId` foreign key. Migrated from single-user in recent update.
- **PWA** — Serwist service worker with precaching, runtime caching, navigation preload. Enabled in production only.
- **OG Images** — Dynamic generation via `next/og` ImageResponse (edge runtime). Explicit `images` in metadata to avoid conflicts with file-based convention.
- **metadataBase** — Uses `NEXT_PUBLIC_APP_URL` (not `NEXTAUTH_URL`) to ensure correct OG image URLs in production builds.
