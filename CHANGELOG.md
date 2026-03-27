# Changelog

All notable changes to MoneyStyle are documented here.

## [2.1.0] - 2026-03-28

### Added
- **Blog View Tracking** — Server-side unique view counting with fingerprint (admin-only stats)
- **Telegram Link Flow** — Users link account via 6-digit code instead of manual bot setup
- **Telegram Inline Keyboards** — Interactive buttons for /start, /help, and after linking
- **Onboarding Feature Flag** — Admin can enable/disable onboarding wizard globally
- **Product Hunt Badge** — Featured on Product Hunt badge in landing hero
- **Open Source Badge** — GitHub link in landing hero
- **Shared SiteFooter** — Consistent footer with social links across all pages (X, LinkedIn, Instagram, GitHub, Telegram)
- **ColorPicker Component** — Shared reusable color picker for form dialogs
- **FormDialogFooter Component** — Shared Cancel/Save footer for all form dialogs
- **useAsyncData Hook** — Replaces useState+useEffect+useCallback data fetching pattern
- **Growth Strategy Guide** — Marketing page with phased strategy and key benchmarks
- **Channel Strategy** — Marketing page with objective-based channel recommendations

### Changed
- **Centralized Telegram Bot** — One bot for all users; removed per-user bot token/webhook fields
- **Split profile.ts** (1,392 → 310 lines) into income-sources, reserves, installments, bills, bill-negotiation
- **Split transactions-content.tsx** (1,450 → 993 lines) into mobile-list and desktop-table
- **Split landing-content.tsx** (1,255 → 92 lines) into hero, sections, features, footer
- **useReducer** for price-analysis (14 states), merge-suggestions (7), money-chat (7)
- **Memoized charts** — useMemo for dashboard chart data transformations
- **Lazy loaded** dashboard cards and landing sections with dynamic imports
- **Settings Save button** moved from top to inside each settings card
- **Admin tabs** — pill-style responsive tabs instead of full-width
- **Profile tabs** — icon on top, label below pattern
- Removed unused dependencies: date-fns (38MB), react-hook-form (5MB)
- Optimized Dockerfile with multi-stage build and prod-only deps (1.44GB → 1.04GB)

### Fixed
- Onboarding bottom nav hidden during wizard
- Onboarding budget categories now save to database
- Voice button shows AI setup dialog instead of plain toast
- Bulk import AI mode shows setup checklist when AI not configured
- Blog admin page force-dynamic for Docker build
- Telegram webhook auto-restores to production when dev tunnel closes
- setState in useEffect replaced with useSyncExternalStore for Telegram detection
- Bottom padding increased for FAB button accessibility

### Security
- Currency management restricted to admin only
- Telegram bot tokens removed from user settings (central bot only)
- Server actions wrapped in try-catch with error logging
- All Record<string, unknown> params verified to have Zod validation

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
