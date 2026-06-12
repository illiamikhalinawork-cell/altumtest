# Altum Test-Task Automation Pipeline

A **document-driven pipeline** that takes a test-task document from intake all the way to a
fully-built, reviewed end result — **one build phase per task**, where every phase is self-contained,
architecture-reviewed, and chained to the next via a crafted handoff prompt.

For the LinkedIn Agent test task it produced not only the planning answers and reference architecture
(**Phase A**), but an actual **working, runnable product PoC** (**Phase B**). The working project is the
headline deliverable — **start there.**

---

## ▶ The working project — Phase B PoC (start here)

A genuinely runnable **LinkedIn Automation Agent** proof-of-concept: a real NestJS + Socket.IO backend,
a Prisma data model, a live React operator console, and a **real ban-prevention engine** — all running
with **zero external infrastructure** and **100% dry-run**. The headless browser only ever opens a local
fixture file; there is **no call to linkedin.com, no credentials, no proxies, and no ban-evasion logic.**

```bash
cd poc
npm install      # generates the Prisma client, migrates SQLite, seeds a 250-account FAKE fleet
npm run dev      # API on :4000 + live web console on :5173, together (concurrently)
# → open http://localhost:5173
```

> No Docker / Postgres / Redis required. `npm install` provisions everything; `npm run dev` brings the
> whole stack up. Full walkthrough + the REAL-vs-MOCKED matrix: [`poc/README.md`](poc/README.md) and
> [`phases/phase-B-poc.md`](phases/phase-B-poc.md).

**What's built and working (verified live):**

- **Core Feature 1 — Auto-Connection & Spread (deep MVP):** a **250-account fleet** with the full
  `pending → queued → sent → accepted → replied → dead` funnel advancing on its own; a **real
  ban-prevention engine** (state machine + a GateKeeper cap-enforcement point, driven by an in-app
  signal simulator); CSV-file contact upload with a fit-scored distribution preview; a
  message-variation gateway (no templated notes); a sending-policy console; and the **Phase A
  dashboard wired to live data**.
  → [`phase-B-poc.md` §8](phases/phase-B-poc.md#8-core-feature-1-deep-mvp--auto-connection--spread-live)
- **Core Feature 2 — Account Farming:** a per-account farming page (settings + live like/comment/follow
  metrics + a contextual AI-comment demo + a synthetic activity stream), plus the deep Playwright +
  anti-detection + scale spec in [`docs/core2features-explain.md`](docs/core2features-explain.md).
- **Core Feature 3 — Unified Inbox:** spec recorded, **not yet built** — see [`docs/KNOWN-GAPS.md`](docs/KNOWN-GAPS.md).

Live console screens (Phase B, real data):
[Overview](poc/web/screenshots/overview.png) · [Health / Ban-Prevention](poc/web/screenshots/health.png) ·
[Deploy & Distribute](poc/web/screenshots/deploy.png) · [Sending Policy](poc/web/screenshots/sending.png) ·
[Account Farming](poc/web/screenshots/farming.png)
 — earlier safe-slice evidence: [live funnel](poc/screenshots/01-live-funnel.png) · [inbox](poc/screenshots/02-inbox.png)

> **Safety boundary (enforced in code):** a hard `assertFixtureOnly(url)` gate makes a real
> linkedin.com navigation impossible by construction. The ban-prevention engine is real, but it is
> exercised by synthetic signals and **never** operates real evasion. The unsafe parts (a mass fleet
> against live LinkedIn, an anti-detection layer) are deliberately **absent** — see
> [`phase-B-poc.md` §7](phases/phase-B-poc.md#7-what-would-harden-it-toward-production--and-what-should-not-be-built).
