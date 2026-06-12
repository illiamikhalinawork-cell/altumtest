# LinkedIn Automation Agent — Estimation & Proposal (v2, post-PoC)

> **What changed since v1.** v1 was a desk estimate. Since then we **built a working proof-of-concept** of
> the system's *control plane* — Core Feature 1 (Auto-Connection & Spread) and Core Feature 2 (Account
> Farming) as a live, verified dashboard on a 250-account synthetic fleet, plus the single-account inbox
> slice — all **dry-run / fixture-only** (no real LinkedIn, no real accounts). That retires the biggest v1
> unknown ("will this architecture actually hold together?") and lets us re-estimate the *remaining* work —
> the real-world *data plane* — with far more confidence. A one-page version for executives lives in
> `[01-ceo-brief.md](01-ceo-brief.md)`.

## Executive summary

This is a multi-account LinkedIn automation platform: ingest contacts, send human-like connection requests
across 500–1000 accounts, run AI-driven engagement (likes, comments, follows), and route every reply into one
unified inbox with send-as-the-correct-account. **The PoC proves the architecture works** — the funnel, the
cap-never-exceeds ban-prevention engine, the distribution logic, the farming control plane, the
message-variation gateway, and the live dashboard all run end-to-end and are verified. **The hard part was
never the control plane; it is the data plane** — operating ~1000 headful Chrome profiles against a platform
that actively fights exactly this, and doing it without being detected.

**Headline estimate (the number that changed): ~1.5 months** with a small senior team to a **real-account,
production-capable MVP** built on top of the PoC, **gated on one spike going well**. Two areas —
**anti-detection at real scale** and the **unified inbox at 1000-account scale** — plus the **browser-fleet
infra** carry the most uncertainty and drive most of the spread (call it ~~1.5 months if the anti-detection
spike lands, up to ~3 if LinkedIn fights back harder than expected). The original from-scratch ranges
(~~680 / 1,250 / 2,230 solo hours) still describe the *whole* build; the PoC has converted a large slice of
that — the lower-risk control plane — from "estimate" into "done and verified."

Three things that have **not** changed and you still need to hear. First, there is still **no official
LinkedIn API**, so 100% of real LinkedIn interaction is brittle browser automation against a hostile,
frequently-changing DOM. Second, this operates against LinkedIn's User Agreement, so **account bans and DOM
breakage are a permanent maintenance tax** (~0.5–1 FTE ongoing), not a one-time build, and that tax is not in
any build number. Third, **the anti-detection thesis is still unproven against real LinkedIn** — the PoC
demonstrates a *real* ban-prevention engine, but it is exercised by a synthetic signal simulator, never by
real evasion. Whether the humanization actually defeats LinkedIn's 2025–26 detection is the one thing you
cannot desk-estimate or PoC away; it needs an empirical red-team spike before the full build.

Constraint note (unchanged): the brief specifies neither seniority nor a definition of done. Every number is
conditioned on a stated basis — senior engineers, a working-but-fragile MVP, customer-supplied accounts — and
moves if that basis differs.

## What we built (the PoC) — and what it deliberately does not do

A genuinely runnable, zero-infra, **dry-run** PoC (`poc/`), plus a non-functional design mockup (`dashboard/`).
**Built and verified live:**

- **Core Feature 1 — Auto-Connection & Spread (deep MVP):** CSV paste **and** file upload → a distribution
engine (eligibility + fair-spread + dedupe + per-assignment fit score/rationale) → the full living funnel
`pending → queued → sent → accepted → replied → dead` → a **real ban-prevention engine** (explicit health
state machine `healthy → at_risk → paused → logged_out`, a `GateKeeper` that makes the daily cap
**provably impossible to exceed**, randomized timing, sleep-days, active-hours, SSI throttle, auto-pause +
6–12h cooldown) → a **message-variation gateway** (similarity/dedup, measured distinctiveness, near-dup
flag) → a live 250-account dashboard. *Verified:* 0 cap violations fleet-wide, paused accounts throttle to
0, hard signal → pause with a 6–12h cooldown + persisted event, the funnel advances on its own, durable-queue
recovery on restart.
- **Core Feature 2 — Account Farming:** per-account settings (global + override: tone, auto-like/comment/
follow, 5–10 likes/day, 3–5 follows/day, comment delay, follow-target filters), live ledger-derived metrics,
a **contextual comment generator** (tone-adapted, references the post, measured non-templated), and a
synthetic like → comment → follow activity stream — all behind the *same* cap + health gates. *Verified:*
farming caps never exceeded, paused accounts never farm, connect funnel unaffected.
- **The dashboard:** Overview (live funnel + KPIs), Health/Ban-Prevention (250-cell heatmap + inject-signal +
live cooldowns), Deploy, Sending Policy, Account Farming, and a single-account inbox with **send-as-the-
correct-account** (dry-run). Live over Socket.IO.
- **Proven production seams** (swappable behind interfaces): SQLite → Postgres, in-memory scheduler →
BullMQ/Redis, Playwright-fixture → Adspower, stub generator → Claude Haiku.

**What it deliberately does NOT do (the boundary, enforced in code):** a hard `assertFixtureOnly(url)` gate
makes a real `linkedin.com` navigation impossible; everything is dry-run; accounts are fake; AI is a
deterministic stub behind a human-review gate; the farming/signal activity is a synthetic simulator that
never touches a browser or the network; **no anti-detection / ban-evasion is operated anywhere.** The PoC
proves the *control plane*; the real engine + anti-detection are *specified* in
`[../docs/core2features-explain.md](../docs/core2features-explain.md)`, not run.

## Business value (why this helps the business)

*(Unchanged from v1, validated by the PoC's unit-cost picture.)* The buyer is a B2B lead-gen agency or
outbound team that already rents 50–800 LinkedIn accounts and runs point tools (Expandi, HeyReach, Dripify)
on each, paying people to babysit them. They lose revenue the moment accounts get banned mid-campaign, and
already pay $30–80/account/month for managed sending plus $15–50/aged account to acquire. The value is
**consolidation and asset protection**: one dashboard replaces a stack of per-account SaaS seats + VA labor +
manual inbox triage, and pushes account-survival up via behavioral randomization and auto-pause — protecting
the most expensive asset, the aged-account pool. For the company building it, the model is high-margin SaaS at
$20–60/account/month; a single 500-account customer is $10–30k MRR. **The blunt counterweight stands:** the
whole business runs on activity LinkedIn prohibits, so customer lifetime is governed by LinkedIn's enforcement
cadence; durability and defensibility are the open question.

## Unit economics — does the business close? *(validated direction)*


| Cost line                             | Per account / month | Notes                                     |
| ------------------------------------- | ------------------- | ----------------------------------------- |
| Residential/mobile proxy (1:1 sticky) | $4–8                | Dominant variable cost                    |
| Browser compute (shared lease pool)   | $1–3                | ~300–500 live profiles, not 1000          |
| LLM for notes + comments (Haiku)      | <$1                 | ~$300–400/month total across 500 accounts |
| Adspower license (amortized)          | $1–2                | Enterprise / per-profile tier             |
| **Direct cost**                       | **~$7–14**          | vs **$20–60** list price                  |


Gross margin ~65–80% at typical pricing. **The PoC reinforces the key v1 finding:** the LLM line everyone
fears is the smallest item (the stub generator runs at zero cost; Haiku is cents/account/month), and the
control-plane compute is trivial. The margin risk is the two costs *outside* this table: ~0.5–1 FTE of
permanent maintenance (the DOM/anti-bot arms race) and account-replacement churn on ban waves. **The business
closes on unit cost; it lives or dies on account survival and maintenance load.** Validate on a 25-account
pilot before the 500–1000 architecture.

## Task 1 — Total estimate

**The PoC changes the shape of this answer.** The control plane is built and verified, so "will the
architecture work" is no longer a risk line — it is a delivered artifact. What remains is the **real-account
data plane**: swapping the fixtures for real Adspower + Playwright, building the real Voyager/DOM action
library, wiring real AI, standing up proxies + the browser fleet, building Feature 3 for real, and — the one
that gates everything — **proving anti-detection on real accounts**.

**Headline: ~1.5 months, small senior team, to a real-account production-capable MVP (Phase-1 wedge), gated
on the anti-detection spike.**


| Scope                                                                                                    | Estimate                               | Basis                                                                                                     |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **PoC control plane (Features 1 & 2 + dashboard + inbox slice)**                                         | **done & verified**                    | what this submission delivered                                                                            |
| Real-account **Phase-1 MVP** (safe-send + unified inbox on customer Adspower profiles, AI behind review) | **~1.5 months / ~350–550 team-hours**  | small senior team (1 infra/automation + 1 backend/product, part-time AI), **gated on the red-team spike** |
| Full **3-feature, 1000-account production** (farming live, Feature 3 at scale, fleet hardened)           | **+~~2–4 months / +~~700–1,100 hours** | the rest of the data plane + scale + hardening                                                            |
| Anti-detection red-team spike (go/no-go before the above)                                                | **~2 weeks, time-boxed**               | empirical; cannot be desk-estimated                                                                       |
| Ongoing maintenance (DOM + anti-bot arms race)                                                           | **~0.5–1 FTE indefinitely**            | not in any build number                                                                                   |


**Why the spread.** Most of the uncertainty lives in exactly two features plus the infra: anti-detection
(does the humanization actually beat LinkedIn's behavioral + device-graph detection at fleet scale?), the
unified inbox at 1000-account / 5-minute cadence (Voyager fragility + ban-correlated polling + RAM), and the
Adspower fleet at 500–1000 concurrent profiles. If the spike lands and the inbox cadence relaxes to 30–60 min,
the low end is real; if LinkedIn fights, the high end is real. **Read ~1.5 months as the planning figure for
the next proof point (a real-account pilot), not as "the whole product, done."**

> Reconciliation with v1: the from-scratch ranges (~680 / 1,250 / 2,230 solo hours) still describe the entire
> build. The PoC has delivered the lower-risk ~30–40% of that work (the control plane) and, more importantly,
> retired its risk — so the *remaining* hours are both fewer and far better understood.

## Task 2 — Feature breakdown (what's built vs. what's left for real)

The PoC built the **logic/control plane** of each feature on synthetic, dry-run data. The remaining hours are
the **real-world data plane** — real accounts, real LinkedIn DOM/Voyager, real AI, real anti-detection — which
is where the depth and the risk actually live. (Remaining hours ≈ senior-engineer hours to a working,
real-account version; multiply by the maintenance tax for "stays working".)


| Feature / layer                              | Built in the PoC (verified)                                                                                                | What's left for real (the hard part)                                                                                                                                                                                            | Remaining | Confidence |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| Adspower / browser orchestration             | Lease-pool interface + Playwright-against-fixture lifecycle                                                                | Real Adspower Local API over CDP, per-host control-plane agent, multi-host sharding, crash/zombie recovery at scale                                                                                                             | 70–150    | medium     |
| Account / session & login state              | Per-account model, health states, locks (one-action-per-profile)                                                           | Real cookie persistence, checkpoint/CAPTCHA/logged-out detection on the real DOM, re-auth surfacing                                                                                                                             | 50–120    | medium     |
| Scheduling + randomization                   | **Built & verified:** caps, gaps, sleep-days, active-hours, evening bias, backpressure, durable-queue recovery (in-memory) | Swap to BullMQ/Redis (documented seam), tune real cadence vs rate limits                                                                                                                                                        | 25–60     | high       |
| Feature 1 — auto-connection & spread         | **Built & verified:** CSV+file ingest, distribution+fit-score, full 6-state funnel, acceptance/reply simulation            | Real connect+note via DOM action library, real acceptance polling, replace simulator with live results                                                                                                                          | 60–130    | medium     |
| Feature 2 — AI farming (like/comment/follow) | **Built & verified:** settings, caps, health-gated synthetic like→comment→follow, contextual comment gen                   | Real feed read + like/comment/follow DOM actions, real post-content read, Haiku wiring, novelty dedup on real feeds                                                                                                             | 70–150    | medium     |
| Message/comment generation (no-template)     | **Built & verified:** stub generator + measured similarity/dedup gateway + distinctiveness score                           | Swap stub → Claude Haiku/Sonnet, blocklist, confidence gates, prompt-cache, real cost controls                                                                                                                                  | 30–60     | medium     |
| **Anti-detection & account-health**          | **Engine built & verified** (state machine, GateKeeper, cooldowns) — but driven by a *synthetic* signal simulator          | **The real thing:** Bézier mouse / human typing-scroll-dwell, fingerprint↔proxy↔TZ coherence, cross-account decorrelation, real CAPTCHA/429/checkpoint detection feeding the engine — **and proving it works (red-team spike)** | 140–300   | **low**    |
| Feature 3 — unified inbox sync               | Single-account inbox slice + send-as-account (dry-run); read model shapes defined                                          | **Not built.** Real per-account Voyager/DOM poll, normalize/dedup/threading at 1000 accounts, incremental cursors, the 5-min cadence question                                                                                   | 130–260   | **low**    |
| Unified inbox UI + reply send-as-account     | Send-as-correct-account proven (single account, dry-run); shapes defined                                                   | Cross-account searchable/filterable table, unread filter, sentiment tag, reply at scale                                                                                                                                         | 50–100    | medium     |
| Dashboard + real-time KPIs / heatmap         | **Built & verified:** live funnel, KPI tiles, 250-cell heatmap, drilldowns, Socket.IO                                      | Polish, the two deferred UI gaps (below), auth-gated multi-tenant views                                                                                                                                                         | 30–70     | high       |
| Auth, multi-account data model & API         | Data model + ledger + read models built (single-tenant)                                                                    | Operator auth/roles, multi-tenant, audit log, billing-per-account                                                                                                                                                               | 40–90     | high       |
| Infra / DevOps for browser-worker fleet      | Zero-infra PoC (SQLite + in-memory) with documented seams                                                                  | Real fleet: 300–500 concurrent Chromium across worker VMs, Adspower topology, proxy plumbing, Postgres/Redis, metrics/alerting                                                                                                  | 90–220    | **low**    |
| Testing & hardening with **real accounts**   | Self-verified invariant suites on the synthetic system                                                                     | Staging harness on real accounts, soak testing, the red-team ban-rate measurement, bug-fix buffer                                                                                                                               | 60–160    | medium     |


**The three low-confidence lines — anti-detection, inbox sync, and fleet infra — still dominate the
uncertainty** (roughly 360h–780h of the remaining range), exactly as v1 predicted. The PoC's contribution is
that *everything above them* is now de-risked.

## Task 3 — Clear vs. uncertain (now: proven vs. still-unknown) + the PoC→production checklist

### Clear — and now PROVEN by the PoC (no longer just "estimable")

- The **data model + funnel state machine** (`pending→…→dead`) — built, drives every counter, race-safe,
rebuilds from the ledger on restart.
- **Per-account capping + the cap-never-exceeds guarantee** — built and *verified* (0 violations fleet-wide;
paused → 0). This was a v1 "build immediately" item; it is now a delivered invariant.
- **The scheduler/randomization** (caps, gaps, sleep-days, active-hours, evening bias, backpressure) — built.
- **Distribution across accounts** (eligibility + fair-spread + dedupe + fit score) — built.
- **The dashboard** (CSV upload, deploy, health heatmap, KPI tiles, drilldowns, live Socket.IO) — built.
- **Message/comment generation with measured per-account variation** (similarity/dedup, distinctiveness
score, near-dup flag) — built; "unique, not templated" is *measured*, not aspirational.
- **Inbox aggregation layer + reply-routing-to-the-originating-account** — proven for one account (dry-run);
the cross-account version is a known extension of the same shapes.
- **Signal-based auto-pause + cooldown + health states** — built as a real engine (the *signals* are
synthetic; the *reaction* is real).

### Uncertain — still needs a spike / real accounts (the PoC could not retire these)

- **Does the humanization actually defeat LinkedIn's 2025–26 detection?** Still the #1 unknown. The PoC's
ban-prevention engine reacts correctly to signals, but it has never faced a real detector. **Spike:
2-week red-team** — 20–30 burner accounts on aged profiles + residential proxies, real action mix with
Bézier input for 3–4 weeks, measure restriction rate vs. a hand-operated control. **Go/no-go gate before
the full build.** You cannot PoC this away.
- **The unified inbox at 1000 accounts / 5-min cadence.** Voyager messaging GraphQL (cheap, fragile,
ban-correlated) vs. headless DOM fleet (RAM-heavy). **Spike: 1 week** to benchmark both on 5–10 accounts
and decide with real numbers. Phase-03 already recommends defaulting to a configurable 30–60 min cadence.
- **Adspower at 500–1000 concurrent profiles** (localhost-bound, single-host API). **Spike: 1–2 weeks** —
load-test one host for max stable profiles, design multi-host sharding, get 1000-profile license terms in
writing.
- **Account acquisition / warm-up / replacement** and **1:1 residential-proxy strategy** — empirical vendor
trials; validated inside the red-team spike.
- **Real AI comment quality at the public-post bar** — the stub proves the *gate* (review queue, dedup,
confidence); real Haiku output quality + the topic-blocklist false-positive rate need real evaluation.
- **LinkedIn DOM/Voyager drift** — not a discrete spike; a standing ~30–50%-of-an-FTE maintenance allocation +
selector/endpoint version abstractions + canary accounts.

### The concrete PoC → production checklist (what it takes to leave proof-of-concept)

1. **Run the anti-detection red-team spike** (go/no-go) — *before* anything below.
2. Swap the **fixture lease → real Adspower** over CDP; remove `assertFixtureOnly`; stand up the multi-host
  fleet + 1:1 residential proxies.
3. Build the **real action library** (connect+note, like, comment, follow, open-conversation, send-reply) on
  the real DOM/Voyager, behind versioned selectors + the humanization layer (Bézier mouse, human typing).
4. Wire the **real AI** (Claude Haiku 4.5 / Sonnet 4.6) into the existing generator + dedup gate; keep the
  human-review-queue default.
5. Swap the **documented seams**: SQLite → Postgres, in-memory scheduler → BullMQ/Redis, stub → Haiku
  (interfaces already exist; this is wiring, not redesign).
6. **Build Feature 3 for real** (per-account Voyager poll → normalize/dedup/thread → cross-account read model
  → reply-send-as-account at scale).
7. Add **multi-tenant auth, audit log, billing**, observability (OTel/Prometheus/Grafana/Sentry), and the two
  deferred UI gaps.
8. **Pilot on 25 accounts**, measure real unit cost + restriction rate, then scale.

## Task 4 — Product questions, concerns & proposals

*(The forcing questions still stand; the PoC sharpens a few answers.)*

- **Account sourcing & ownership** — who supplies the 500–1000 accounts + Adspower profiles? Still the single
biggest hidden scope item. **Recommendation unchanged: do not build account sourcing**; make customer-supplied
accounts a hard prerequisite.
- **Ban-liability ownership** — when LinkedIn mass-restricts the pool (it will), who eats it? Needs a contract
answer (best-effort survival, customer owns risk) before code.
- **AI comment quality bar & approval** — the PoC *demonstrates the answer*: a generate-then-review queue,
per-account confidence gate, similarity/dedup, and a topic blocklist, with **auto-post off by default**.
This is now a shown default, not a proposal.
- **Success metric** — accounts-kept-alive vs. meetings-booked vs. messages-sent? Pulls the product in
different directions; if it's meetings, weight the roadmap toward the inbox/reply-intelligence.
- **Detection-signal access** — auto-pause reads CAPTCHA/429/checkpoint/slow-response. The PoC proves the
*engine* consuming these; the open question is reading them reliably off the real DOM (maintenance burden).
- **SSI is not a real-time control loop** — free at `linkedin.com/sales/ssi`, weekly, scrape-only, no API. The
PoC already treats it as a **lagging weekly KPI** and drives the live controller from observable signals
(acceptance/reply/challenge rates) — the correct reframing, now built.
- **Data residency & PII / GDPR** — we ingest contact CSVs and store every inbound message from thousands of
real people; cold-contacting EU subjects without lawful basis is real exposure. Retention + erasure API are
core, not optional.
- **Inbox freshness vs cost** — 5-min polling of 1000 accounts is the single largest infra/ban-surface driver;
default to a configurable 30–60 min with on-demand per-account refresh.
- **Message uniqueness — measured, not aspirational** — the PoC *measures* distinctiveness (similarity/dedup +
a fleet score). The residual risk is LinkedIn fingerprinting *structural* sameness across LLM-varied text;
the variance budget is now observable, not a guess.

**Compliance / ToS concern (unchanged, stated plainly):** this product operates against LinkedIn's User
Agreement and Professional Community Policies, which prohibit automation, scraping, bots, false identities, and
multiple/fake accounts. hiQ addressed logged-out scraping of public data; it does not bless logged-in,
authenticated automation across hundreds of accounts (LinkedIn ultimately prevailed on remand on breach of
contract + a CFAA claim tied to fake-account access; ~$500K stipulated judgment in late 2022, plus injunctions
against multi-account bot operators). Outreach at 7,500–10,000/day implicates anti-spam and GDPR/ePrivacy.
Operating 500–1000 fabricated/purchased identities is itself a likely violation. **None of the technical
mitigations — including everything in the PoC — make the activity ToS-compliant; they only reduce detection
probability, which is a different thing from being permitted.** The risk sits primarily with the fleet
operator; we want it scoped, acknowledged in writing, and steered toward LinkedIn's sanctioned surfaces where
the business goal allows.

**Proposals:**

- **Phase 1 = the wedge, not the platform.** Ship multi-account safe-send + unified inbox on customer-supplied
Adspower profiles; defer live AI farming to Phase 2. The PoC already proves the Phase-1 control plane.
Definition of done: 50 accounts sustained for 4 weeks under the red-team restriction threshold, inbox
freshness < 30 min, zero cross-account action collisions in a soak test.
- **Do not build account sourcing.** Customer-supplied accounts are a hard prerequisite.
- **Build-vs-buy on the hardest layer** — study HeyReach (multi-account send + unified inbox for agencies);
scope against feature parity, not a blank page.
- **Human in the loop on all public AI actions** (comments especially) for v1 — the PoC's default. Auto-post is
an earned Phase 2+ trust feature.
- **Re-center durable value on reply intelligence** — an AI inbox that classifies sentiment, flags hot leads,
and drafts context-aware replies per account survives a send-side crackdown better than the sender.
- **Write ban-liability + SLA terms before building.**
- **Validate per-account infra cost on a 25-account pilot** before the 500–1000 architecture.
- **Default the inbox poll to 30–60 min**, on-demand refresh per account.
- **Offer the lower-risk first-party fork** (one company automating its own employees' accounts, with consent)
as an explicit alternative — far less ToS/legal risk, opens enterprise sales the gray-hat version cannot.
- **Treat LinkedIn DOM/Voyager as a continuously maintained surface** — budget 15–50% of an FTE in the
run-rate.

## Task 5 — Tech stack *(rechecked; the PoC validates it, with a few updates)*

The v1 stack stands and is now **partially validated in code**. Updates marked **(updated)** / **(validated)**.


| Layer                     | Choice                                                                                                                                                                                                                                            | Status / why                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                   | TypeScript / Node 20+ / **NestJS** core; thin Python 3.12/FastAPI only for the AI pipeline if isolated                                                                                                                                            | **(validated)** — the PoC API is NestJS + Prisma; DI/seams/realtime all proved out                                                                                   |
| Job queue / scheduler     | **BullMQ on Redis 7** (per-account queues + delayed jobs) behind a `Scheduler` interface                                                                                                                                                          | **(validated seam)** — PoC ships an in-memory impl of the same interface (caps/jitter/backpressure/boot-recovery all working); prod swaps to BullMQ with no redesign |
| Browser automation        | **Playwright (Node) over CDP**, attached to Adspower via the Local API                                                                                                                                                                            | **(validated seam)** — PoC drives Playwright against a local fixture behind a `ProfileLease` interface; prod swaps the fixture for Adspower                          |
| Browser fleet topology    | 10–20 worker VMs, ~~30–50 live profiles each, Redis lease registry; **~~300–500 concurrent**, not 1000                                                                                                                                            | unchanged — the lease-pool model is built in the PoC                                                                                                                 |
| Primary data store        | **PostgreSQL 16** + Prisma (system of record)                                                                                                                                                                                                     | **(validated seam)** — PoC runs the identical Prisma schema on SQLite; only the datasource provider changes                                                          |
| Cache / ephemeral         | Redis 7 (BullMQ, rate counters, profile leases, pub/sub)                                                                                                                                                                                          | unchanged                                                                                                                                                            |
| Realtime                  | **Socket.IO** (Redis adapter); poll-then-push                                                                                                                                                                                                     | **(validated)** — PoC streams funnel/health/farming/inbox deltas over Socket.IO                                                                                      |
| AI (comments + sentiment) | **Claude Haiku 4.5** default, **Sonnet 4.6** fallback for high-value; **(updated)** evaluate **Fable 5** for the cheap sentiment classifier; prompts carry post text + tone + per-account style seed                                              | **(validated seam)** — PoC ships a deterministic stub + the *same* similarity/dedup gate the model output will pass through; ~$300–400/mo total                      |
| Frontend                  | **(updated)** PoC uses **Vite + React + TS + Tailwind + shadcn-style + Recharts** (validated, fast); production can stay on this or move to **Next.js 14** if SSR/SEO matters — not a blocker. TanStack Table + virtualization for the inbox grid | the inbox is a large virtualized searchable table; the dashboard is KPI-heavy                                                                                        |
| Proxy / identity          | Adspower fingerprints + **1:1 sticky residential/mobile proxy** per account (Bright Data / Oxylabs / IPRoyal), health-checked                                                                                                                     | unchanged — core ban-prevention concern                                                                                                                              |
| Infra / hosting           | Browser workers on desktop-class compute (Hetzner dedicated / EC2 m6i/c6i, **not** serverless) running Adspower in Docker; stateless API/inbox/AI on ECS/k8s; managed Postgres+Redis; Terraform                                                   | unchanged                                                                                                                                                            |
| Observability             | OpenTelemetry → Tempo; Prometheus/Grafana (per-account action counts, ban-signal rate, queue depth, **review-queue depth**); Loki; Sentry; Playwright trace+screenshot on failure                                                                 | unchanged — ban prevention is an observability problem                                                                                                               |
| Account-health engine     | An explicit **state machine per account** (the PoC builds this as a transition table; XState in prod) consuming the action-result stream                                                                                                          | **(validated)** — built and verified in the PoC                                                                                                                      |
| Credential & PII security | Per-account session cookies under **per-account envelope encryption (KMS)**; secrets in a vault; retention window + GDPR erasure API                                                                                                              | unchanged — the cookie store is the highest-value breach target                                                                                                      |


**Alternatives worth knowing** *(unchanged):* Go (chromedp) for raw concurrency but weaker Adspower/velocity;
Puppeteer (lighter, no auto-wait/tracing); Temporal (durable per-account workflows, heavier); GPT-4o-mini /
self-hosted Llama/Qwen for AI (only above ~50k comments/day); OpenSearch only once Postgres FTS/trigram is
outgrown; GoLogin/Multilogin/Kameleo/Dolphin Anty as Adspower alternatives behind a fingerprint-vendor
abstraction.

**Scale notes** *(unchanged, now partly demonstrated):* real concurrency is far below 1000 (~10k actions/day
over ~16h ≈ 10–12 actions/sec fleet-wide — trivial compute). The hard constraints are **RAM and IP identity**,
not throughput; a lease pool keeps ~300–500 live. The PoC demonstrates the per-account queueing, cap locking,
and boot-recovery that make this safe. **Where n8n fits:** *not* the orchestration engine (it can't give
per-profile leasing or sub-second concurrency control across hundreds of browsers); only optional periphery
glue — alerting, Slack/email on ban-wave detection, CRM sync of booked meetings, reporting digests.

## Gaps we should record + real features worth adding

**Known gaps (tracked, deferred — see `[../docs/KNOWN-GAPS.md](../docs/KNOWN-GAPS.md)`):**

- **Campaign / deployment-runs history view** — runs persist (Campaign + assignments + ledger) but there's no
list endpoint / browse UI yet.
- **Per-account Sending Policy UI** — per-account overrides are fully supported by the model + API; the screen
only edits the global policy today.
- **Core Feature 3 (Unified Inbox)** — designed (reference architecture) and the single-account slice is built;
the full cross-account build is the recorded next feature.

**Real features worth adding (beyond the three core features):**

- **Reply intelligence** — sentiment + hot-lead tagging (the PoC inbox has the seam) + per-account AI reply
drafting behind the same review gate. This is the durable, crackdown-resilient value.
- **Account warm-up automation** — a ramp scheduler (a few actions/day → target over 2–4 weeks) so new/cold
accounts don't trip verification; the scheduler already supports per-account caps.
- **Proxy health management** — pre-session IP health checks, automatic quarantine + swap of a burned proxy
with account warm-down.
- **A/B testing of message variants** — measure acceptance/reply by opener/skeleton, feed the winners back —
natural extension of the variation gateway.
- **Canary accounts + selector-drift alerting** — synthetic accounts that detect DOM/Voyager breakage early.
- **CRM / webhook integrations** — push hot leads + booked meetings to the customer's CRM (legit n8n territory).
- **Multi-tenant + billing-per-account + audit log** — the SaaS backbone for selling it.
- **The first-party fork** — same engine, consented single-company deployment, far lower ToS/legal risk and an
enterprise sales path.

## Risks, assumptions & open questions

**Hard risks (existential first) — unchanged in substance:**

- **Mass account bans from behavioral + device-graph detection.** A 1000-account fleet on one stack is a
detectable cluster even with per-account jitter. *The PoC does not reduce this risk — it is the one thing the
PoC explicitly does not test.* Mitigation: the red-team ban-rate spike before full build; 1:1 residential
proxies; fingerprint isolation; ramped volumes; human-like input; de-correlated schedules; canaries; a funded
replacement conveyor.
- **Unofficial inbox/message access is fragile and ban-correlated** (high-freq authenticated polling is a
classic bot signal). Mitigation: spike both architectures; lengthen/stagger polls; abstract the fetch layer.
- **Adspower at 500–1000 concurrent profiles** (localhost-bound, single-host). Mitigation: multi-host sharding,
hard caps, load-test, enterprise licensing in writing, a fingerprint-vendor fallback.
- **Fleet homogeneity** (same hosting/proxy pool/timing/AI style) makes the population statistically
distinguishable even when each account looks human alone. Mitigation: diversify ASNs/fingerprints/timezones,
randomize per-account behavioral params, vary AI tone/model, monitor for synchronized bans.
- **The maintenance tax** (~0.5–1 FTE indefinitely) is real and in no build number.

**Assumptions:** senior engineers; ~30 productive hrs/week; in-scope is a real-account MVP built on the PoC;
out-of-scope (account acquisition/warm-up, proxies/licenses, sustained anti-ban hardening, SRE/on-call, SOC2/
legal, localization, mobile) is excluded from build numbers and treated as risk; customer supplies the accounts.

**Open questions that move scope/pricing/go-no-go:** who supplies/owns the accounts; who owns ban liability and
whether there's a survival SLA; real inbox-freshness requirement (5 min vs 30–60 min); the success metric the
customer pays for; validated per-account infra cost; the AI-comment approval model; whether the first-party
fork is acceptable. **And the one the PoC surfaced as decisive: the result of the anti-detection red-team
spike — it gates the entire real-account build.**