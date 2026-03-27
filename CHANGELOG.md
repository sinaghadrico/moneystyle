# Changelog

All notable changes to MoneyStyle are documented here.

## [2.0.0] - 2026-03-27

### Added
- **Money Pilot** — AI financial scoring (0-100), investment suggestions, 1/3/5-year projections
- **Bill Negotiator** — AI analyzes bills and suggests savings strategies
- **Money Mood** — Emotional spending tracker on transactions
- **Merchant Intelligence** — Merchant profiles with spending trends
- **Travel Mode** — Trip management with auto-tagged transactions
- **Financial Challenges** — Gamification with streaks, badges, leaderboards
- **Price Watch** — Alerts for price changes on frequent purchases
- **Net Worth Dashboard** — Assets vs liabilities overview
- **Budget Rollover** — Carry unspent budget to next month
- **Onboarding Wizard** — 4-step new user setup
- **Spending Wrapped** — Year-end financial summary cards
- **Household Sharing** — Multi-user households with invitations
- **Feature Flags** — 40+ toggleable features for gradual rollouts
- **Voice Transactions** — Whisper + GPT-4 speech-to-transaction
- **Meal Planner** — AI weekly meal plans from grocery purchases
- **Weekend Planner** — AI activity plans (Budget/Balanced/Premium)
- **Smart Shopping** — Price comparison across stores
- **Money Chat** — Conversational AI for financial Q&A
- **Telegram Bot** — Central bot with /link flow, inline keyboards
- **SMS Auto-Import** — Bank SMS parsing with regex patterns
- **API v1** — REST API with key-based auth
- **Blog CMS** — Admin blog with AI generation
- **Competitor Pages** — SEO landing pages vs YNAB, Monarch, etc.
- **PWA** — Installable app with offline support

### Changed
- Migrated from single-user to multi-user architecture
- Centralized Telegram bot (one bot for all users)
- Merged Money Advice into Money Pilot
- Renamed Wealth Pilot to Money Pilot

### Security
- NextAuth.js v5 with JWT strategy
- HMAC verification for Telegram webhooks
- Row-level security on all database queries
- Admin-only currency and feature flag management

## [1.0.0] - 2025-12-01

### Added
- Core transaction tracking (CRUD with filters)
- Receipt scanning (GPT-4 Vision)
- Budget management with category limits
- Savings goals with progress tracking
- Multi-currency support with exchange rates
- Telegram bot integration
- Dashboard with charts (Recharts)
- Google & GitHub OAuth
- Docker deployment
- Dark mode
