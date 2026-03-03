## Overall constraints

- **Auth**: `next-auth` with **GitHub** and **Google** providers only (no password auth).
- **Hosting**: All portfolios are hosted on **kno.li’s own infrastructure + database** (no GitHub-hosted apps, no embedded external tracking script).
- **Scope**: Start with a small but complete vertical slice: login → create one app → view public profile → basic analytics.

## Phase 1 – Auth, users, basic shell

- **Set up authentication**
  - Configure `next-auth` with GitHub and Google providers.
  - Persist users in the database with a `users` table (id, email, name, avatar, created_at).
  - On first login, create a user row if it does not exist.
  - Add a global `AuthSessionProvider` and protect dashboard routes.
- **Username & profile model**
  - Add `profiles` (or extend `users`) with:
    - `username`, `display_name`, `bio`, `avatar_url`.
    - `plan` field (free, premium, ultra).
  - Enforce username rules on create/update:
    - Free: minimum 4 characters.
    - All plans: cannot use reserved routes or blacklisted / offensive words.
  - Add T&C consent flag for username policy.
- **Basic app layout**
  - Implement `app/layout.tsx` with theme provider, navbar, and footer.
  - Implement public landing page explaining the product and plans.
  - Add initial docs/FAQ pages for username and plan rules.

## Phase 2 – App model, templates, and public profile

- **App & content schema**
  - Create `apps` table:
    - `id`, `owner_id`, `template_id`, `slug`, `primary_username`, `status`, timestamps.
  - Create `app_content` table:
    - `app_id`, `content` JSONB (flexible schema), optional `is_published` flag.
  - Add a `templates` registry (in code) listing available templates and their default config.
- **Public routing**
  - Implement routing: `kno.li/<username>` → resolve to:
    - The user’s primary app (one app per username at MVP).
  - If username not found → show “Profile not found” page.
  - If app misconfigured → show “Invalid config” page.
- **Template rendering**
  - Implement 1–2 initial React templates (e.g. simple profile, profile + links).
  - Templates consume the JSON content and render sections (hero, socials, links, projects).
  - Add basic responsive styling with the existing design system (buttons, cards, etc.).

## Phase 3 – Plans, gating, and dashboard

- **Plans & limits**
  - Define three plans in code:
    - Free: max 1 app, basic analytics, no custom domain.
    - Premium: up to 3 apps, full analytics, custom domains.
    - Ultra: up to 15 apps, full analytics, custom domains, early features.
  - Implement a `plan-features` module that:
    - Maps a user to effective plan.
    - Exposes checks like `canCreateApp`, `maxApps`, `hasFullAnalytics`, `canAttachCustomDomain`.
- **Dashboard shell**
  - Add `/dashboard` layout with sidebar navigation (Home, Apps, Analytics, Profile, Settings).
  - Implement `/dashboard` home:
    - Show current plan, usage (apps used vs max), and quick links.
- **Create & manage apps**
  - Implement `/dashboard/create-app` flow:
    - Pick template, set app name, optionally confirm username/slug mapping.
    - Validate plan limits (block creation if over limit; show upgrade CTA).
  - Implement `/dashboard/manage-apps`:
    - List apps with status and quick actions (view, edit, delete).
  - Implement basic app editor:
    - Simple form that edits JSON-backed content for the selected template.

## Phase 4 – Custom domains (premium/ultra)

- **Domain model & backend**
  - Create `domains` table:
    - `id`, `app_id`, `hostname`, `status`, `verification_token`, `verified_at`, `created_at`, `type`.
  - Add API routes to:
    - Create a domain (plan-gated).
    - Trigger verification check.
    - Delete domains.
- **Verification flow**
  - When user adds a domain, generate DNS record (TXT/CNAME) with `verification_token`.
  - Build a verification endpoint/job that:
    - Looks up DNS, validates token, and marks domain as `verified`.
  - Update docs to show DNS configuration steps (A/AAAA/CNAME to kno.li infra).
- **Runtime routing**
  - Implement middleware to:
    - Check `Host` header; if it matches a verified domain, resolve `app_id`.
    - Else, use `kno.li/<username>` path routing.
  - Ensure non-verified domains show a safe default response.

## Phase 5 – In-house analytics

- **Data collection**
  - Design `analytics_events` table:
    - `id`, `app_id`, `event_type`, `visitor_id`, `timestamp`, `country`, `ip_hash`, `path`, `referrer`, `user_agent`, `metadata`.
  - Implement `/api/analytics/collect` endpoint:
    - Accept events from public pages.
    - Resolve `app_id` from request context (host + path).
    - Apply basic rate limiting and validation.
  - Implement a lightweight browser tracker:
    - On public app pages, send page-view and click events with anonymous id.
- **Aggregation & queries**
  - Add simple aggregate views/queries:
    - Total views, unique visitors, last 7/30 days per app.
    - Top countries and referrers.
  - Optionally add `analytics_daily` table for pre-aggregated counts.
- **Analytics dashboard**
  - Implement `/dashboard/analytics`:
    - App selector dropdown.
    - Charts for views and visitors over time.
    - Table for top countries and referrers.
  - Gate advanced breakdowns by plan:
    - Free: basic totals and short time window.
    - Premium/Ultra: full charts and all breakdowns.

## Phase 6 – Billing & subscriptions (Polar)

- **Polar integration**
  - Configure products/plans in Polar for Free, Premium, Ultra (Free is default, no checkout).
  - Implement `/api/polar/checkout`:
    - Creates a Polar checkout session for target plan, returns redirect URL.
  - Implement `/api/polar/webhook`:
    - Handle subscription lifecycle events.
    - Update a local `subscriptions` table:
      - `user_id`, `plan`, `status`, `current_period_end`, `cancel_at_period_end`.
- **Settings UI**
  - In `/dashboard/settings`:
    - Show current plan and billing status.
    - Buttons to upgrade/downgrade via Polar checkout.
    - Surface renewal and cancellation info.
- **Plan enforcement**
  - Use `plan-features` in:
    - App creation, domain APIs, and analytics UI.
    - Any future feature checks.

## Phase 7 – Polish, security, and policies

- **Security & reliability**
  - Add rate limiting to:
    - Auth-related sensitive routes.
    - Analytics collect endpoint.
    - Domain management APIs.
  - Add basic error logging for routing and analytics.
- **Legal & policy pages**
  - Create T&C and Privacy Policy pages that:
    - Explain username ownership rules and reclaim policy.
    - Explain analytics data usage and IP/geolocation handling (aggregated, privacy-friendly).
- **UX polish**
  - Improve empty states and onboarding in dashboard.
  - Add upgrade CTAs wherever a gated feature is surfaced.
  - Ensure mobile responsiveness for public profiles and dashboard.

