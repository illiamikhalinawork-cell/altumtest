import type { ReviewDraft } from "@/types";
import { inboxRows } from "./inbox";
import { intBetween, isoMinutesAgo, makeRng } from "./seed";

// Human-review-default trust model: AI proposes replies, a human approves.
// These are drafts waiting in the approval queue.
const INTENTS = [
  "Book a meeting",
  "Send case study",
  "Answer pricing question",
  "Route to procurement",
  "Polite decline + re-engage Q3",
  "Share security one-pager",
];

const DRAFT_BODIES = [
  "Happy to help — here's a 2-page overview and a logistics case study. Could we grab 15 minutes {day}?",
  "For a team of 40 you'd be on our Growth tier; I'll send exact numbers, but the short version is it pays back in the first quarter.",
  "Totally understand the timing. I'll check back early July — in the meantime I'll send a short async demo you can forward internally.",
  "Great question — we're SOC 2 Type II and support EU data residency. I'll attach our security brief and DPA.",
  "Looping in the right context: we differ mainly on compliant per-account pacing and a unified inbox. Want me to send a side-by-side?",
];

export const reviewQueue: ReviewDraft[] = (() => {
  const rng = makeRng(0xc0ffee);
  const candidates = inboxRows.filter(
    (r) => r.sentiment !== "negative" && !r.isRead,
  );
  const drafts: ReviewDraft[] = [];
  const n = Math.min(7, candidates.length);
  for (let i = 0; i < n; i++) {
    const row = candidates[i];
    drafts.push({
      id: `draft_${String(i + 1).padStart(3, "0")}`,
      conversationId: row.conversationId,
      senderName: row.senderName,
      senderCompany: row.senderCompany,
      accountSource: row.accountSource,
      intent: INTENTS[i % INTENTS.length],
      draftBody: DRAFT_BODIES[i % DRAFT_BODIES.length].replace(
        "{day}",
        ["Tuesday", "Wednesday", "Thursday"][i % 3],
      ),
      createdAt: isoMinutesAgo(intBetween(rng, 2, 90)),
      confidence: 0.62 + rng() * 0.34,
    });
  }
  return drafts;
})();

export const reviewQueueDepth = reviewQueue.length;
