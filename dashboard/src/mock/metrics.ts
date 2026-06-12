import type { FunnelSnapshot, KpiSnapshot } from "@/types";
import { activeAccountCount, totalAccountCount } from "./accounts";
import { hotLeadCount } from "./inbox";
import { reviewQueueDepth } from "./reviewQueue";

// Headline numbers are pinned to the spec:
//   "Messages sent today: 7,500 | Replies received: 340 |
//    Active accounts: 295/300 | Hot leads: 12"
export const initialKpi: KpiSnapshot = {
  messagesSentToday: 7_500,
  connectionsSentToday: 5_820,
  acceptedToday: 1_640,
  repliesReceivedToday: 340,
  activeAccounts: Math.max(activeAccountCount, 295),
  totalAccounts: totalAccountCount,
  hotLeads: Math.max(hotLeadCount, 12),
  reviewQueueDepth,
};

// Connection funnel: pending → queued → sent → accepted → replied → dead.
// Tuned to the spec's "500 pending | 45 accepted today | 8 replied" feel
// while staying consistent with a ~7,500 sends/day operation.
export const initialFunnel: FunnelSnapshot = {
  campaignId: null, // null === all campaigns
  pending: 500,
  queued: 1_240,
  sent: 5_820,
  accepted: 1_640,
  replied: 340,
  dead: 410,
  failed: 96,
  skipped: 212,
};

// Per-campaign funnel slices for the campaign filter on Overview.
export const campaignFunnels: Record<string, FunnelSnapshot> = {
  cmp_q2_logistics: {
    campaignId: "cmp_q2_logistics",
    pending: 220,
    queued: 540,
    sent: 2_410,
    accepted: 712,
    replied: 158,
    dead: 180,
    failed: 41,
    skipped: 88,
  },
  cmp_fintech_founders: {
    campaignId: "cmp_fintech_founders",
    pending: 175,
    queued: 430,
    sent: 1_980,
    accepted: 561,
    replied: 121,
    dead: 132,
    failed: 33,
    skipped: 74,
  },
  cmp_eu_expansion: {
    campaignId: "cmp_eu_expansion",
    pending: 105,
    queued: 270,
    sent: 1_430,
    accepted: 367,
    replied: 61,
    dead: 98,
    failed: 22,
    skipped: 50,
  },
};

export const campaignOptions = [
  { id: "all", label: "All campaigns" },
  { id: "cmp_q2_logistics", label: "Q2 — Logistics ICP" },
  { id: "cmp_fintech_founders", label: "Fintech Founders" },
  { id: "cmp_eu_expansion", label: "EU Expansion" },
];

// 14-day trend for the small sparkline-style area chart on Overview.
export interface TrendPoint {
  day: string;
  sent: number;
  replies: number;
  accepted: number;
}

export const sendTrend: TrendPoint[] = [
  { day: "May 30", sent: 6120, replies: 248, accepted: 1320 },
  { day: "May 31", sent: 6480, replies: 271, accepted: 1402 },
  { day: "Jun 02", sent: 5980, replies: 233, accepted: 1288 },
  { day: "Jun 03", sent: 6890, replies: 301, accepted: 1511 },
  { day: "Jun 04", sent: 7120, replies: 318, accepted: 1576 },
  { day: "Jun 05", sent: 7340, replies: 326, accepted: 1602 },
  { day: "Jun 06", sent: 6950, replies: 289, accepted: 1498 },
  { day: "Jun 09", sent: 7210, replies: 304, accepted: 1544 },
  { day: "Jun 10", sent: 7480, replies: 331, accepted: 1620 },
  { day: "Jun 11", sent: 7390, replies: 322, accepted: 1588 },
  { day: "Jun 12", sent: 7500, replies: 340, accepted: 1640 },
];
