// =====================================================================
// Domain types for the LinkedIn Automation Agent operator console.
// These interfaces match the architecture spec exactly and are the
// single source of truth shared across the mock data + UI layer.
// =====================================================================

export interface KpiSnapshot {
  messagesSentToday: number;
  connectionsSentToday: number;
  acceptedToday: number;
  repliesReceivedToday: number;
  activeAccounts: number;
  totalAccounts: number;
  hotLeads: number;
  reviewQueueDepth: number;
}

export type HealthState = "healthy" | "at_risk" | "paused" | "logged_out";

export interface CapUsage {
  used: number;
  cap: number;
}

export interface AccountHealth {
  accountId: string;
  displayName: string;
  proxyRegion: string;
  healthState: HealthState;
  cooldownUntil: string | null;
  ssi: number | null;
  capsToday: {
    connect: CapUsage;
    like: CapUsage;
    comment: CapUsage;
    follow: CapUsage;
    reply: CapUsage;
  };
  lastActionAt: string | null;
  lastSyncedAt: string | null;
}

export interface FunnelSnapshot {
  campaignId: string | null;
  pending: number;
  queued: number;
  sent: number;
  accepted: number;
  replied: number;
  dead: number;
  failed: number;
  skipped: number;
}

export type Sentiment = "positive" | "neutral" | "negative" | null;

export interface InboxRow {
  conversationId: string;
  accountId: string;
  accountSource: string;
  senderName: string;
  senderCompany: string | null;
  preview: string;
  lastMessageAt: string;
  sentiment: Sentiment;
  hotLead: boolean;
  unreadCount: number;
  isRead: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  body: string;
  senderName: string;
  receivedAt: string;
  sentBy: "human" | "ai" | null;
  status: "received" | "sent" | "send_failed" | null;
}

// ----- UI-only helper types (not part of the persisted spec) ----------

export interface ReviewDraft {
  id: string;
  conversationId: string;
  senderName: string;
  senderCompany: string | null;
  accountSource: string;
  draftBody: string;
  intent: string;
  createdAt: string;
  confidence: number; // 0..1, advisory only — humans approve by default
}

export type ScreenId = "overview" | "inbox" | "health" | "campaigns";
