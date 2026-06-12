import type { InboxRow, Message, Sentiment } from "@/types";
import { accounts } from "./accounts";
import {
  COMPANIES,
  FIRST_NAMES,
  INBOUND_PREVIEWS,
  LAST_NAMES,
  OUTBOUND_OPENERS,
} from "./pools";
import { chance, intBetween, isoMinutesAgo, makeRng, pick } from "./seed";

const CONVERSATION_COUNT = 62;

function rollSentiment(rng: () => number, preview: string): Sentiment {
  const lower = preview.toLowerCase();
  if (lower.includes("remove me") || lower.includes("not interested"))
    return "negative";
  if (
    lower.includes("let's") ||
    lower.includes("calendar") ||
    lower.includes("impressed") ||
    lower.includes("budget approved") ||
    lower.includes("worth")
  )
    return "positive";
  const r = rng();
  if (r < 0.18) return "negative";
  if (r < 0.55) return "neutral";
  return r < 0.95 ? "positive" : null;
}

interface Thread {
  row: InboxRow;
  messages: Message[];
}

function buildThread(rng: () => number, index: number): Thread {
  const senderFirst = pick(rng, FIRST_NAMES);
  const senderName = `${senderFirst} ${pick(rng, LAST_NAMES)}`;
  const senderCompany = chance(rng, 0.92) ? pick(rng, COMPANIES) : null;
  const account = accounts[intBetween(rng, 0, accounts.length - 1)];
  const preview = pick(rng, INBOUND_PREVIEWS);
  const sentiment = rollSentiment(rng, preview);
  const minutesAgo = intBetween(rng, 3, 5 * 24 * 60);
  const isRead = chance(rng, 0.5);
  const unreadCount = isRead ? 0 : intBetween(rng, 1, 3);
  const hotLead = sentiment === "positive" && chance(rng, 0.45);

  const conversationId = `conv_${String(index + 1).padStart(3, "0")}`;

  const row: InboxRow = {
    conversationId,
    accountId: account.accountId,
    accountSource: account.displayName,
    senderName,
    senderCompany,
    preview,
    lastMessageAt: isoMinutesAgo(minutesAgo),
    sentiment,
    hotLead,
    unreadCount,
    isRead,
  };

  // Build a short but believable back-and-forth thread.
  const opener = pick(rng, OUTBOUND_OPENERS)
    .replace("{first}", senderFirst)
    .replace("{company}", senderCompany ?? "your team");

  const messages: Message[] = [
    {
      id: `${conversationId}_m1`,
      conversationId,
      direction: "outbound",
      body: opener,
      senderName: account.displayName,
      receivedAt: isoMinutesAgo(minutesAgo + intBetween(rng, 1200, 4000)),
      sentBy: chance(rng, 0.7) ? "ai" : "human",
      status: "sent",
    },
    {
      id: `${conversationId}_m2`,
      conversationId,
      direction: "inbound",
      body: preview,
      senderName,
      receivedAt: isoMinutesAgo(minutesAgo + intBetween(rng, 200, 1000)),
      sentBy: null,
      status: "received",
    },
  ];

  // ~60% of threads have an AI follow-up reply already sent.
  if (chance(rng, 0.6) && sentiment !== "negative") {
    messages.push({
      id: `${conversationId}_m3`,
      conversationId,
      direction: "outbound",
      body:
        "Absolutely — sharing a one-pager and a couple of relevant case studies now. " +
        "Would " +
        pick(rng, ["Tuesday", "Wednesday", "Thursday"]) +
        " at " +
        pick(rng, ["10:00", "11:30", "14:00", "15:30"]) +
        " work for a quick call? I'll send from this account so it stays in one thread.",
      senderName: account.displayName,
      receivedAt: isoMinutesAgo(minutesAgo),
      sentBy: "ai",
      status: chance(rng, 0.04) ? "send_failed" : "sent",
    });
  }

  return { row, messages };
}

const threads: Thread[] = (() => {
  const rng = makeRng(0xb0b);
  const list: Thread[] = [];
  for (let i = 0; i < CONVERSATION_COUNT; i++) list.push(buildThread(rng, i));
  // Most-recent first.
  return list.sort(
    (a, b) =>
      new Date(b.row.lastMessageAt).getTime() -
      new Date(a.row.lastMessageAt).getTime(),
  );
})();

export const inboxRows: InboxRow[] = threads.map((t) => t.row);

export const messagesByConversation: Record<string, Message[]> =
  Object.fromEntries(
    threads.map((t) => [
      t.row.conversationId,
      t.messages
        .slice()
        .sort(
          (a, b) =>
            new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
        ),
    ]),
  );

export const accountSources: string[] = Array.from(
  new Set(inboxRows.map((r) => r.accountSource)),
).sort();

export const hotLeadCount = inboxRows.filter((r) => r.hotLead).length;
export const unreadCount = inboxRows.filter((r) => !r.isRead).length;
