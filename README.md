# cutefolio

Host portfolios and linkfolios for yourself, your brand, or your SaaS. Includes per-profile analytics, custom domains, customizable templates, and dynamic OG images.

## Features

- **Portfolios & linkfolios** — Multiple templates with customization (fonts, colors, layout)
- **Custom domains** — Connect your own domain via Vercel API
- **Analytics** — Page views, link clicks, geo, and visitor fingerprinting
- **Billing** — Polar integration for Pro/Ultra plans (checkout, portal, webhooks)
- **Auth** — Google sign-in via NextAuth

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Drizzle ORM + PostgreSQL
- **Auth:** NextAuth v5
- **Billing:** Polar (checkout, customer portal, webhooks)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL
- Polar account (for billing)
- Vercel account (for custom domains)

### 1. Install dependencies

```bash
bun install
```

### 2. Environment

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `SITE_URL` | App URL (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` | Polar billing |
| `NEXT_PUBLIC_POLAR_PRODUCT_*` | Polar product IDs (Pro/Ultra monthly/yearly) |
| `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` / `VERCEL_TEAM_ID` | Custom domain management |

### 3. Database

```bash
bun run db:generate
bun run db:migrate
```

### 4. Run

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run start` | Run production build |
| `bun run lint` | ESLint |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run migrations |
| `bun run db:push` | Push schema to DB |

## Project Structure

```
app/              # Next.js app router
├── [username]/   # Profile pages (cutefolio/username)
├── api/          # API routes (auth, apps, analytics, polar, og)
├── dashboard/    # Dashboard (manage apps, analytics, plan, profile)
├── login/        # Login
└── ...

components/       # React components
├── dashboard/    # Dashboard UI
├── landing/      # Landing page sections
├── ui/           # Shared UI (shadcn)
└── ...

lib/              # Core logic
├── services/     # Apps, analytics, domains
├── repositories/ # Data access
├── og/           # OG image generation
├── auth.ts       # NextAuth config
└── ...

db/               # Drizzle schema & queries
templates/        # Portfolio & linkfolio templates
drizzle/          # SQL migrations
```
