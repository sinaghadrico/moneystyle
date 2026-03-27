# Contributing to MoneyStyle

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose

## Development Setup

```bash
# 1. Fork & clone
git clone https://github.com/YOUR_USERNAME/moneystyle.git
cd moneystyle

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Start database & storage
docker compose up -d db minio

# 5. Run migrations & seed
pnpm db:migrate
pnpm db:seed

# 6. Start dev server
pnpm dev
# Open http://localhost:3020
```

## Coding Standards

- **TypeScript** strict mode
- **ESLint**: run `pnpm lint` before committing
- **Mobile-first** responsive design with Tailwind
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **Sonner** for toast notifications
- **ResponsiveDialog** for modals (Dialog on desktop, Drawer on mobile)

### Server Actions

All mutations use Server Actions in `src/actions/`:

- Always call `requireAuth()` first
- Validate input with Zod schemas
- Call `revalidatePath()` after mutations
- Return `{ success: true }` or `{ error: "message" }`

### Component Patterns

- Mobile-first with responsive prefixes (`md:`, `lg:`)
- Use `FeatureGate` for feature-flagged content
- Tab bars: icon on top, label below
- Cards on mobile: stacked rows, not side-by-side

## Commit Messages

Use conventional commits:

```
feat(transactions): add voice transaction support
fix(dashboard): correct budget rollover calculation
docs(readme): add deployment guide
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make changes with clear commits
3. Run `pnpm lint` and `pnpm build`
4. Test on mobile viewport
5. Open a PR with description
6. Link related issues
7. Address review feedback

## Areas We Need Help

- Bank sync integration (Plaid/Open Banking)
- Unit and integration tests
- Translations (Arabic, Spanish, Portuguese, French)
- Accessibility improvements
- Performance optimization
- Blog content (financial tips, guides)
- Documentation improvements

## Questions?

- [GitHub Discussions](https://github.com/sinaghadrico/moneystyle/discussions)
- [Open an Issue](https://github.com/sinaghadrico/moneystyle/issues)
