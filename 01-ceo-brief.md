# LinkedIn Automation Agent — CEO brief

*One-page executive read. Full detail: [`01-estimation-and-proposal.md`](01-estimation-and-proposal.md).*

**Where we are:** we built a working proof-of-concept of the system's control plane — Features 1
(Auto-Connection) and 2 (Account Farming) as a live, verified dashboard on a 250-account fleet — all dry-run,
no real accounts. The architecture is proven. What's left is the real-world part: real accounts, real
LinkedIn, and — the one thing that gates everything — proving we don't get detected.

---

### Task 1 — Total estimate

**~1.5 months** with a small senior team to a real-account, production-capable MVP, building on the PoC.
**Two areas — anti-detection and the unified inbox at 1000-account scale — plus the browser-fleet infra carry
the most uncertainty and drive most of the spread:** ~1.5 months if the anti-detection spike lands, up to ~3
if LinkedIn fights back. Roughly **350–550 team-hours** for the Phase-1 wedge (safe-send + unified inbox on
customer accounts); the full 3-feature, 1000-account production is another ~2–4 months on top. The control
plane is done; this number is for the next proof point, not "the whole product."

*(Plus a permanent ~0.5–1 FTE maintenance tax — the DOM/anti-bot arms race — that sits in no build number.)*

### Task 2 — Feature breakdown (what's built vs. what's left)

We built the **logic** of each feature; the remaining cost is the **real-account data plane** (real LinkedIn
DOM/API, real AI, real anti-detection).

- **Feature 1 — Auto-Connection:** control plane **done & verified** (funnel, distribution, cap-never-exceeds).
  Left: real connect-via-browser + acceptance polling. **~60–130h.**
- **Feature 2 — Account Farming:** control plane **done & verified** (settings, caps, contextual comments,
  activity). Left: real like/comment/follow on the live feed + real AI. **~70–150h.**
- **Anti-detection engine:** engine **built & verified**, but driven by a *simulator*. Left: the real
  humanization (mouse/typing/fingerprint/proxies) **and proving it works**. **~140–300h.** ← biggest unknown.
- **Feature 3 — Unified Inbox:** designed + single-account slice built; **not built at scale**. Left: per-
  account poll + merge into one inbox at 1000 accounts. **~130–260h.** ← second-biggest unknown.
- **Fleet infra:** zero-infra PoC with documented seams. Left: 300–500 real concurrent browsers + proxies.
  **~90–220h.**

### Task 3 — Clear vs. uncertain

- **Now clear (proven by the PoC):** the data model + funnel, the cap-never-exceeds ban-prevention engine, the
  scheduler/randomization, distribution across accounts, the dashboard, measured non-templated messaging, and
  reply-from-the-correct-account. These were estimates in v1; they're delivered now.
- **Still uncertain (needs real accounts / a spike):** (1) does the humanization actually beat LinkedIn's
  detection — a **2-week red-team spike, go/no-go before the full build**; (2) the inbox at 1000 accounts /
  5-min cadence; (3) Adspower at 500–1000 concurrent profiles; (4) account sourcing/warm-up + proxies.
- **To leave proof-of-concept:** run the red-team spike → swap fixture for real Adspower + proxies → build the
  real browser action library → wire real AI → flip the documented seams (Postgres, BullMQ/Redis) → build
  Feature 3 → pilot on 25 accounts.

### Task 4 — Product questions (the ones that change the deal)

Who supplies and **owns the accounts**? Who **owns ban liability** (it *will* happen)? Is **5-min inbox
freshness** real or will 30–60 min do (it's the biggest cost driver)? What does the customer actually pay for
— **accounts alive vs. meetings booked**? **Honest bottom line:** this operates against LinkedIn's ToS; bans
are a certainty, not an edge case — no technical mitigation makes it *permitted*, only *less detectable*. Get
it scoped and acknowledged in writing, keep a human-approval gate on all public AI comments (the PoC's
default), and offer a lower-risk first-party (consented, single-company) fork.

### Task 5 — Tech stack

Stays as proposed and **the PoC validates it**: NestJS + Prisma + Postgres, BullMQ/Redis, Playwright-over-CDP +
Adspower, Socket.IO, Claude Haiku 4.5 (Sonnet 4.6 fallback), React/Tailwind dashboard, 1:1 sticky residential
proxies. The PoC runs the same code on swappable seams (SQLite→Postgres, in-memory→BullMQ, fixture→Adspower,
stub→Haiku), so production is wiring, not redesign. *n8n is not the engine — only optional ops glue.*

---

**Bottom line:** the risky "will it work" question is answered for the control plane. **One decision gates the
rest — the anti-detection red-team spike.** Fund that 2-week spike before committing to the full real-account
build; everything else is well-understood work on a proven architecture.
