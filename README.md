# Revenue - Personal Finance Tracker

A full-stack personal finance tracking application with a Telegram bot integration for quick transaction entry.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 + Prisma ORM
- **UI**: Tailwind CSS 4, shadcn/ui, Radix UI
- **Charts**: Recharts
- **Validation**: Zod
- **Bot**: Telegram Bot API (webhook)
- **Runtime**: Node.js 22, pnpm
- **Deploy**: Docker + Docker Compose

## Features

- Dashboard with income/expense charts, category breakdown, merchant analysis
- Transaction management (CRUD, filtering, sorting, pagination)
- Category & account management with custom colors
- Transaction merging for duplicate handling
- Receipt/media file attachment and viewer
- Telegram bot for quick transaction entry, deletion, and monthly stats
- Dark mode support

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

Create a `.env` file in the project root:

```env
# Database (Docker PostgreSQL)
DATABASE_URL="postgresql://revenue:revenue123@localhost:5434/revenue"
DIRECT_URL="postgresql://revenue:revenue123@localhost:5434/revenue"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-bot-token-here"
TELEGRAM_WEBHOOK_SECRET="any-random-secret-string"
```

### 3. Start Database

```bash
docker compose up db -d
```

Wait for PostgreSQL to be healthy, then run migrations:

```bash
pnpm db:migrate
```

### 4. Seed Database (optional)

```bash
pnpm db:seed
```

This loads sample transactions from `transactions.json` and creates default categories and accounts.

### 5. Start Dev Server

```bash
pnpm dev
```

App runs at [http://localhost:3020](http://localhost:3020).

To use a custom port:

```bash
PORT=3020 pnpm dev
```

---

## Docker Deployment (Full Stack)

Build and run everything in Docker:

```bash
# Start database + app
docker compose up -d

# First-time: run migrations and seed
docker compose --profile seed up seed
```

The app will be available at [http://localhost:3020](http://localhost:3020).

### Docker Services

| Service | Description | Port |
|---------|-------------|------|
| `db` | PostgreSQL 16 Alpine | 5434 |
| `app` | Next.js production server | 3020 |
| `seed` | One-time migration + seed (profile: `seed`) | - |

---

## Telegram Bot

The bot lets you record transactions, delete them, and view monthly stats directly from a Telegram chat or channel.

### Setup

1. Create a bot via [@BotFather](https://t.me/BotFather) and get the token
2. Add the token to `.env` as `TELEGRAM_BOT_TOKEN`
3. Start the dev server
4. Expose your local server with a tunnel:

```bash
# Using Cloudflare (free, no signup)
cloudflared tunnel --url http://localhost:3020

# Or using ngrok
ngrok http 3020
```

5. Set the webhook:

```bash
npx tsx scripts/setup-telegram-webhook.ts https://your-tunnel-url.com/api/telegram
```

6. Add the bot to your Telegram channel/group as an admin

### Managing Webhook

```bash
# Set webhook
npx tsx scripts/setup-telegram-webhook.ts https://your-url.com/api/telegram

# View current webhook info
npx tsx scripts/setup-telegram-webhook.ts

# Delete webhook
npx tsx scripts/setup-telegram-webhook.ts --delete
```

### Transaction Messages

Send messages in this format to record transactions:

```
[+]amount merchant [#category] [@account]
```

| Part | Required | Description |
|------|----------|-------------|
| `amount` | Yes | Number. Prefix `+` for income, no prefix = expense |
| `merchant` | No | First word(s) after amount |
| `#category` | No | Fuzzy-matches existing category name |
| `@account` | No | Fuzzy-matches account name. Default: first account |
| Next line | No | Description |

Persian numerals (۰-۹) are supported.

**Examples:**

```
250 Carrefour #grocery
+15000 Salary #income @farnoosh
1200 DEWA #utilities
50.5 Uber
350 کارفور #grocery
خرید هفتگی
```

**Bot replies with confirmation:**

```
Saved: 250 AED expense at Carrefour (Grocery) [Farnoosh Mashreq] #a1b2c3
```

The `#a1b2c3` at the end is the short ID used for deletion.

### Delete Commands

| Command | Description |
|---------|-------------|
| `del a1b2c3` | Delete by short ID (from confirmation) |
| `del a1b2c3 d4e5f6` | Delete multiple by short IDs |
| `del last` | Delete last telegram transaction |
| `del last 3` | Delete last 3 telegram transactions |
| `حذف last` | Persian keyword works too |

### Stats Commands

| Command | Description |
|---------|-------------|
| `stats` | Current month report |
| `stats last` | Previous month |
| `stats 2026-01` | Specific month (YYYY-MM) |
| `stats jan` | Month by name (current year) |
| `آمار` or `گزارش` | Persian keywords work too |

**Example output:**

```
📊 February 2026

Grocery      ████████░░░░  42%  2,350 AED
Transport    ████░░░░░░░░  18%    980 AED
Utilities    ███░░░░░░░░░  14%    750 AED
Food         ██░░░░░░░░░░  10%    530 AED
Shopping     █░░░░░░░░░░░   5%    280 AED

Total                          4,890 AED
23 transactions

💰 Income: 15,000 AED
📉 Net: 10,110 AED
```

---

## Database

### Schema

Three main models:

- **Category** — name, color, icon
- **Account** — name, bank, color, icon
- **Transaction** — date, time, amount, currency, type (income/expense/transfer/other), category, account, merchant, description, source, media files, merge support

### Useful Commands

```bash
# Run migrations
pnpm db:migrate

# Open Prisma Studio (GUI for database)
pnpm db:studio

# Seed database
pnpm db:seed

# Reset database (destructive)
npx prisma migrate reset
```

---

## Project Structure

```
src/
├── app/                        # Next.js pages & API routes
│   ├── page.tsx                # Dashboard
│   ├── layout.tsx              # Root layout (sidebar + header)
│   ├── transactions/           # Transactions page
│   ├── accounts/               # Accounts page
│   ├── categories/             # Categories page
│   ├── merge-suggestions/      # Merge suggestions page
│   └── api/telegram/           # Telegram webhook endpoint
│
├── actions/                    # Server Actions
│   ├── transactions.ts         # Transaction CRUD + queries
│   ├── accounts.ts             # Account management
│   ├── categories.ts           # Category management
│   ├── dashboard.ts            # Dashboard stats & chart data
│   └── merge.ts                # Transaction merge logic
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/                 # Sidebar, Header
│   ├── dashboard/              # Stats cards, charts, filters
│   ├── transactions/           # Transaction table, forms, dialogs
│   ├── accounts/               # Account list, forms
│   ├── categories/             # Category list, forms
│   └── merge/                  # Merge suggestions
│
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── telegram.ts             # Bot parser, stats, delete logic
│   ├── validators.ts           # Zod schemas
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # Formatting helpers
│   └── constants.ts            # App constants
│
└── hooks/
    └── use-debounce.ts         # Debounce hook

prisma/
├── schema.prisma               # Database schema
├── seed.ts                     # Seed script
└── migrations/                 # Migration history

scripts/
├── up.sh                       # Start everything (DB + server + tunnel + webhook)
├── down.sh                     # Stop everything
└── setup-telegram-webhook.ts   # Telegram webhook CLI
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `pnpm dev` | Start development server |
| Build | `pnpm build` | Build for production |
| Start | `pnpm start` | Run production build |
| Lint | `pnpm lint` | Run ESLint |
| Migrate | `pnpm db:migrate` | Run Prisma migrations |
| Seed | `pnpm db:seed` | Seed database |
| Studio | `pnpm db:studio` | Open Prisma Studio |
| Webhook | `npx tsx scripts/setup-telegram-webhook.ts <url>` | Set Telegram webhook |
| **Start all** | `./scripts/up.sh` | DB + server + tunnel + webhook |
| **Stop all** | `./scripts/down.sh` | Stop everything + remove webhook |
