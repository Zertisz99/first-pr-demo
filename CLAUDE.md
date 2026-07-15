@AGENTS.md

# Athleticore

International multi-sport athlete platform (profiles, recovery journal, teams,
scouting). Next.js 16 (App Router/Turbopack) + TypeScript + Tailwind v4 +
Prisma 7 + Auth.js v5 (Credentials, not Auth0) + Postgres.

## Quick start

```
npx prisma dev --name athleticore --detach   # starts/reuses the local Postgres
npx prisma dev ls                            # check it's running
npm run dev
```

Env vars live in `.env` (already populated for local dev — `DATABASE_URL`,
`SHADOW_DATABASE_URL`, `AUTH_SECRET`). `.env.example` documents the real shape.

**Test accounts:**
- Coach: `marcus@example.com` / `coachpassword1` (Marcus Webb, owns team
  "Westside Tennis Juniors")
- Athlete: `priya@example.com` / `tabletennisace1` (Priya Nandakumar, tennis,
  handle `priya-nandakumar`, active on Marcus's team, has a recovery-journal
  entry logged)
- 5 unclaimed demo profiles (no login): `amara-okafor`, `luka-peric`,
  `sofia-lindqvist`, `kenji-nakamura`, `zola-mabaso`

## Environment quirks worth knowing before you debug them yourself

- **No Docker, no real installed Postgres, no `gh` CLI.** Postgres runs via
  Prisma's embedded dev server (see Quick start). Homebrew on this machine has
  no precompiled bottles for this macOS version, so `brew install` anything
  means a slow full source compile — prefer `nvm` for Node and the embedded
  Prisma dev server over Homebrew/Docker installs.
- **Schema changes:** use `npx prisma db push --accept-data-loss`, not
  `prisma migrate dev` — the embedded dev DB's PGlite backend has a protocol
  incompatibility with the migrate engine's shadow-database diffing. Run
  `npx prisma generate` after, then **fully stop/restart the dev server**
  (not just reload) — `src/lib/db.ts` caches a Prisma client on `globalThis`
  across Turbopack HMR that goes stale when the client is regenerated.
- **New dynamic routes:** run `npx next typegen` before `PageProps<'/route'>`
  types resolve.
- This Next.js version has real breaking changes from older training data —
  check `node_modules/next/dist/docs/` before assuming an API (bit us on async
  `params`, the `PageProps` helper, and Prisma 7's driver-adapter requirement).
- When testing in a browser preview: after `location.href = ...`, verify
  `document.readyState` and `location.pathname` before interacting — a click
  fired mid-navigation silently lands on the wrong page. Give interactive
  elements unique `id`s rather than relying on selectors like
  `button[type="submit"]` — the site header always renders its own submit
  button (Log out), which will win a generic selector.

## Status

**Built:** athlete profiles (view + owner-gated edit), CSS-driven sport
theming (`data-sport` attribute cascade + `--color-sport-live` token — see
`src/app/globals.css` and `src/components/SportTheme.tsx`), Discover search,
auth (signup/login/logout, role-gated), coach dashboard (create team,
invite-based roster with pending/active consent), recovery journal (daily
check-in, server-computed readiness score, trend chart, owner-only).

**Schema exists, no UI yet:** injuries, training plans/sessions,
matches/match stats, video upload/tagging/comments, scout watchlist/contact
requests/profile views, guardian/minor account linking.

## Working conventions

- Extend existing schema/config incrementally rather than replacing it
  wholesale — check what's already built before applying a pasted
  snippet/reference doc, since several have conflicted with working code.
- Confirm before destructive or externally-visible actions (git commits with
  a real identity, `gh repo create`, pushing, swapping core infra like the
  database or auth provider).
