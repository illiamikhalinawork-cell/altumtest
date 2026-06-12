# Outreach Console — LinkedIn Automation Agent (UI mockup)

A **non-functional, production-grade-looking** operator console for a LinkedIn
automation platform. It is a polished "ops console" dashboard (Linear / Vercel
aesthetic) built to be screenshotted and reviewed as a design + frontend
artifact.

> ⚠️ **This is a mockup.** Everything is fixture data. There are **no network
> calls, no real backend, and no real LinkedIn integration.** Buttons, the
> message composer, CSV upload, and "Launch campaign" are intentionally inert.
> The only dynamic behavior is a faked "live" ticker (see below).

## What it is

Four screens behind a left sidebar nav with a persistent top KPI header:

1. **Overview** — KPI header tiles, a Recharts connection funnel
   (pending → queued → sent → accepted → replied → dead), a 14-day throughput
   trend, an account-health heatmap preview, and a recent-activity feed.
2. **Unified Inbox** — searchable + filterable table over conversations with the
   exact columns _Sender Name · Company · Message preview · Time received ·
   Sentiment · Account source_. Unread / Hot filters, an account filter, and a
   search box. Clicking a row opens a thread detail panel with a (non-functional)
   AI reply composer that notes replies "send from the correct account
   automatically." A review-queue panel surfaces AI drafts pending human
   approval (human-review-default trust model).
3. **Account Health** — a green/amber/red heatmap over ~300 accounts with state
   filters, "most replies today" and "at ban risk" drilldowns, and a per-account
   panel showing `capsToday`, `cooldownUntil`, `ssi` (labeled as a **weekly
   lagging** metric, not real-time), and `lastSyncedAt`.
4. **Campaigns** — a campaign-deploy screen: a drag-drop CSV zone (non-functional)
   showing the expected columns _Name / Company / Title / LinkedIn URL_,
   account selection from the pool, and humanized spread controls
   (15–20/day, 3–7 min gaps, sleep days).

### The faked "live" feel

`src/hooks/useLiveData.ts` runs a `setInterval` that nudges a few KPI counters
upward and recolors a couple of health-heatmap cells every few seconds. This is
the **only** moving part — there is no data source behind it.

## Run it

```bash
npm install
npm run dev          # http://localhost:4174
```

Other scripts:

```bash
npm run build        # type-check (tsc) + production build to dist/
npm run preview      # serve the built dist/ on :4174
npm run shoot        # Playwright screenshots of all 4 screens (server must be up)
```

Screens are hash-routed, so you can deep-link: `#/overview`, `#/inbox`,
`#/health`, `#/campaigns`.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v3** — refined neutral-zinc dark palette with a single cyan
  accent. UI primitives (Card, Badge, Button, Tabs, Input, Table) are
  hand-written shadcn-style components (the shadcn CLI was **not** used), in
  `src/components/ui/`.
- **Recharts** — funnel + throughput charts.
- **lucide-react** — icons.

## Production-target note

The production system targets **Next.js 14 (App Router)**. This mockup is built
as a **Vite SPA** for reliable, fast, dependency-light headless building and
screenshotting. The React components, types, and mock data transfer to Next.js
essentially as-is: move `src/screens/*` and `src/components/*` into App Router
route segments / client components, replace the hash routing in `App.tsx` with
file-system routes, and swap the static mock imports for server components /
data fetching. No component rewrites required.

## Layout

```
src/
  types.ts                 # exact domain interfaces (single source of truth)
  App.tsx                  # shell: sidebar + KPI header + screen switch
  components/              # Sidebar, KpiHeader, charts, panels, ui/ primitives
  screens/                 # OverviewScreen, InboxScreen, HealthScreen, CampaignsScreen
  hooks/useLiveData.ts     # faked "live" updater (the only dynamic behavior)
  mock/                    # ~300 accounts, ~60 conversations, funnel + KPI, review queue
  lib/                     # cn() + formatting helpers
scripts/screenshot.mjs     # Playwright capture at 1440x900
screenshots/               # overview.png, inbox.png, health.png, campaigns.png
```

`node_modules/` and `dist/` are gitignored.
