# Dashboard & System Guide — LinkedIn Automation Agent (PoC)

A plain-English walkthrough of **what the system does, how it works, and what every control on the dashboard
means.** This describes the running proof-of-concept in [`../poc/`](../poc/) — the live operator console
(`poc/web`) wired to the live API (`poc/api`).

> **Everything here is DRY-RUN / synthetic.** No real LinkedIn, no real accounts, no network sends. A hard
> `assertFixtureOnly` gate makes a real `linkedin.com` navigation impossible; the "fleet activity" is produced
> by in-app **simulators**, and all AI drafts sit behind a human-approval gate. The point of the PoC is to
> prove the *control plane* — the logic that decides, schedules, caps, and tracks every action — not to
> operate the real automation. The banner at the top of the screen reminds you of this at all times.

---

## 1. How to run it

```
cd poc && npm install && npm run dev
```

This starts both halves together and opens the console at **http://localhost:5173** (API on **:4000**).

- **`poc/api`** — the brain. NestJS + Prisma + **SQLite**, a Socket.IO gateway for live updates, an in-memory
  scheduler, and a Playwright-against-a-local-fixture "browser lease". It holds the data model, the engines,
  and the simulators.
- **`poc/web`** — the console. React + Vite + Tailwind. It reads the API over REST for the initial state and
  subscribes to Socket.IO for live deltas, so the screens move on their own.

---

## 2. How the system works (the mental model)

Think of it as a **control plane** (decisions + bookkeeping, fully built here) sitting on top of a **data
plane** (the real browser automation against LinkedIn, which is *documented* but not run in the PoC).

The control plane is built from a few cooperating pieces:

- **The Account fleet (250 fake accounts).** Each has a health state, a per-account "style seed", caps, a
  proxy region label, and an SSI score. This is the synthetic stand-in for the 500–1000 real accounts.
- **The funnel / ledger.** Every connection request is one `ContactAssignment` that moves through
  `pending → queued → sent → accepted → replied → dead` (plus `failed`/`skipped`). An append-only `Action`
  ledger records *what happened* and is the single source of truth for every counter and every cap — there
  are no separate tallies that can drift.
- **The Scheduler.** Decides *when* each account may act: enforces the daily cap, the 3–7-minute gaps,
  active-hours, sleep-days, an evening bias, and applies backpressure (work waits instead of piling up).
- **The Ban-Prevention engine.** A health **state machine** (`healthy → at_risk → paused → logged_out`) plus
  a **GateKeeper** that re-counts the ledger right before every send so the daily cap is *provably impossible
  to exceed*. A hard signal (CAPTCHA / checkpoint / rate-limit) pauses the account for a real 6–12 h cooldown;
  a soft signal (slow response / low SSI) throttles it to ~half.
- **The Distribution engine.** Spreads an uploaded contact list across eligible accounts by a **fit score**
  (spare capacity + health + region/timezone match), dedupes, and explains each choice.
- **The message-variation gateway.** Generates connection notes / comments and *measures* how distinct they
  are (similarity + dedup + a distinctiveness score), so "no templated patterns" is verified, not hoped.
- **The simulators** (what makes the demo alive & safe): a **StateAdvancer** nudges the funnel forward over
  time, a **SignalSimulator** rolls synthetic health signals, and a **FarmingSimulator** drives synthetic
  like→comment→follow activity. None of them touch a browser or the network — they only write dry-run ledger
  rows and emit live events.

**The production seams are real and swappable** (documented, not yet wired): SQLite → Postgres, in-memory
scheduler → BullMQ/Redis, Playwright-fixture → Adspower over CDP, stub generator → Claude Haiku, simulators →
real LinkedIn signal/feed/inbox fetchers. See [`core2features-explain.md`](core2features-explain.md) for the
real-engine + anti-detection design.

---

## 3. The always-on chrome (top bar + sidebar)

### Top KPI header (visible on every screen)

Seven live tiles, all derived from the ledger and refreshed over Socket.IO. The green pulsing dot + "Live ·
synced just now" flashes on every update; the right shows the operator + timezone + date.

| Tile | What it means |
|---|---|
| **Messages sent today** | All outbound dry-run sends today (connections + replies), across all accounts. |
| **Connections sent** | Connection requests sent today; sub-line shows how many were accepted. |
| **Accepted today** | Invites confirmed today. |
| **Replies received** | Inbound messages received today. |
| **Active accounts** | Healthy + at-risk accounts that can act, out of the total fleet (e.g. 237/250). |
| **Hot leads** | Contacts currently in the `replied` state — flagged for follow-up. |
| **Review queue** | AI drafts awaiting human approval (nothing sends until a human approves). |

### Left sidebar

- **Brand + connection indicator** — "Socket.IO live · :4000" (green) when the live link is up, "connecting…"
  (red) when it isn't. If you ever see screens stuck on "loading…", this dot tells you the API link dropped.
- **Nav** — the six screens (below). "Unified Inbox" carries an unread badge.
- **Human Review callout** — a standing reminder that AI drafts default to manual approval, with the current
  queue depth.

---

## 4. The screens (every function explained)

### 4.1 Overview — the live operating picture

The fleet-wide "is it working right now" view for Auto-Connection & Spread.

- **Connection funnel** — horizontal bars for `pending → queued → sent → accepted → replied → dead`, with the
  live counts. Below it: **accept rate** and **reply rate** (computed from the cumulative daily counters, so
  they stay sane), plus `failed` / `skipped`. This is the "500 pending · N accepted · N replied" picture.
- **Live activity** — a streaming feed (newest first) of real-time events: ban-prevention **signals**
  (`captcha → pause`, `slow response → throttle`, …) and **funnel transitions**. The "streaming" badge means
  the socket is delivering.
- **Throughput · recent transitions** — a small chart of connects-sent vs. replies-received, built from the
  live delta stream since the page loaded (it fills as new transitions arrive).
- **Account health** — a preview heatmap of the fleet with a "View all →" link to the Health screen.

### 4.2 Health · Ban-Prevention — keep the accounts alive

The heart of the safety story. Everything here is about *not getting the accounts banned*.

- **Header chips** — live counts of healthy / at-risk / paused / logged-out accounts.
- **Fleet heatmap** — one cell per account (green = healthy, amber = at risk, grey = paused, red = logged
  out). Filter by state (All / Healthy / At risk / Paused / Logged out), search, and **click a cell to
  inspect** it in the detail panel.
- **Inject signal** *(demo control)* — fire a synthetic ban-prevention signal (captcha, checkpoint,
  rate-limit-429, slow-response, …) at the selected account and watch the engine react: a hard signal flips
  it to **paused** with a live cooldown countdown; a soft signal throttles it. "synthetic · no network" means
  it never leaves the app — it only feeds the real engine.
- **Auto-signal simulator** — a background roll-rate (probability per tick) that keeps the fleet realistically
  noisy; toggle on/off and adjust the rate.
- **Cooldowns** — accounts currently paused, each counting down to auto-resume.
- **Signal feed** — the live stream of recent signals, tagged soft/hard, per account.
- **Account detail panel** (right, when a cell is selected) —
  - **Proxy region · last action · last synced · cooldown until** — the account's identity + activity stamps.
  - **Social Selling Index** — the SSI score, marked "weekly · lagging" (it is a slow KPI, not a real-time
    control — the live controller is the signal stream).
  - **Caps used today** — connect / like / comment / follow / reply, each as `used / ceiling`. The connect bar
    shows the base daily ceiling (15–20) and, when throttled/paused, a marker for the lower *effective* cap
    (so a paused account reads "2/17 · throttled 0", never a confusing "2/0").
  - **Pause account / Force resync** — manual overrides.

### 4.3 Deploy & Distribute — turn a contact list into safe, spread-out work

The campaign launcher (this is the "Campaigns" function).

- **Contact CSV** — upload a `.csv` **file** or paste rows (Name, Company, Title, LinkedIn URL).
- **Preview distribution** — dry-runs the distribution *without* persisting: shows the **planned
  distribution** per account — how many contacts each account gets, with the **fit score** (e.g. 0.9) and the
  reasoning (spare capacity, health, region/timezone fit).
- **Deploy** — creates the campaign + assignments. Contacts are unique by LinkedIn URL (no double-assignment).
- **Note variation** — the anti-templating gateway: a **distinctiveness** score, the **worst-pair similarity**,
  and a healthy/review badge. This is the on-screen proof that the generated notes aren't templated.
- **Human-approve drafts** — every generated note is **UNAPPROVED** until you approve it. Approve individually
  or "Approve all". Approving enqueues a **gated, jittered, DRY-RUN** connect (you'll see `queued job-NN
  (+jitter ms)`) — it passes the cap + health gates before it can "send".

### 4.4 Account Farming — credibility-building (Feature 2)

Per-account auto-like / auto-comment / auto-follow. Activity here is **synthetic · dry-run**; the real
Playwright + anti-detection engine is specified in [`core2features-explain.md`](core2features-explain.md).

- **Fleet farming KPIs** — likes / comments / follows today, accounts farming, and **comments in review**
  (comments default to the human-review queue, not auto-posted).
- **How a day of farming runs** — the cadence explainer: auto-like 5–10/day (~90 min apart, unique per
  account's feed), auto-comment 30–60 min after a like (contextual, in the account's tone — not "Great
  post!"), auto-follow 3–5/day by target filters.
- **Contextual comment generator** *(demo)* — pick a sample post + a tone (formal / casual / technical) and
  see the generated comment plus its fleet-distinctiveness score. Demonstrates "AI understands the post and
  writes naturally, no templates."
- **Per-account farming** — a table of the fleet: account · health · tone · likes (used/target) · comments ·
  follows (used/target) · auto toggles. **Click a row to edit that account's override.**
- **Global farming defaults / per-account override** (right) — the editor: comment tone, auto-like/comment/
  follow switches, "auto-post comments (else human review)", daily like/follow targets, comment delay, and
  the auto-follow **target filters** (title / company / location / custom). Save global or per-account.
- **Live farming activity** — the synthetic stream of like → comment (→ review) → follow events, newest first.

> Every farming action passes the **same** ban-prevention gates as connects: paused accounts never farm,
> per-type daily caps are never exceeded, sleep-days/active-hours respected.

### 4.5 Sending Policy — the fleet-wide humanization profile

The knobs that make sending look human. One global default; per-account overrides are supported by the API
(UI for that is a tracked gap — see [`KNOWN-GAPS.md`](KNOWN-GAPS.md)).

- **Daily connect cap** — min/max; each account gets a stable value picked deterministically inside the range
  (the "never exceed 15–20/day" ceiling).
- **Rhythm & think-time** — inter-action **gap** (seconds, real 3–7 min) and intra-action **delay** (ms,
  "think time" before each action).
- **Active hours & sleep days** — the active-hour window, an **evening bias** (>1 stretches activity later in
  the day, more human), and the weekday **sleep days** (no sending).
- **Live sending metrics** (right) — scope, accounts covered, per-account override count, the effective cap /
  gap ranges, active hours, and last-updated. Note: the on-screen timing is **time-compressed** for the demo
  (a real 3–7 min gap shows in seconds); the underlying math is real.

### 4.6 Unified Inbox — replies in one place (Feature 3 slice)

The PoC ships the **single-account** safe slice of the unified inbox (the full cross-account version is the
recorded next feature in [`KNOWN-GAPS.md`](KNOWN-GAPS.md)).

- **Conversation** — the inbound/outbound message thread for the account, newest at the bottom.
- **Simulate inbound reply** — fires a synthetic inbound message (in production this comes from the per-account
  inbox poll) so you can see the live `inbox.new_reply` event arrive.
- **Reply compose → Send (dry-run)** — type a reply and send it. The key behavior: it **routes through the
  correct account's own session/lease** (send-as-the-correct-account, no switching), logs an outbound message
  + a ledger row, and emits `inbox.message_sent`. This is the core Feature-3 mechanic proven end-to-end.

---

## 5. The safety boundary (why this is safe to run)

- **Dry-run, fixture-only** — `assertFixtureOnly(url)` throws on any non-fixture target; the browser lease only
  ever opens a local HTML file, never `linkedin.com`.
- **Fake accounts** — 250 seeded fake profiles, no real credentials, no proxies.
- **AI behind a human gate** — every connection note / comment is an UNAPPROVED draft; nothing sends without a
  human approval, and comments default to a review queue.
- **Simulators, not evasion** — the "fleet activity" (signals, farming, funnel motion) is synthetic; the
  ban-prevention engine is real and verifiable, but the anti-detection/evasion is *described*, never operated.
- **Verified invariants** — caps are never exceeded fleet-wide, paused accounts never act, and the connect and
  farming subsystems don't interfere with each other.

For the deeper "how we'd build the real thing" detail, read
[`core2features-explain.md`](core2features-explain.md) (farming + anti-detection + scale) and the per-feature
reference architectures in [`../phases/`](../phases/).
