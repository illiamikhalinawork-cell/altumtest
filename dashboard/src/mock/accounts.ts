import type { AccountHealth, HealthState } from "@/types";
import { FIRST_NAMES, LAST_NAMES, PROXY_REGIONS } from "./pools";
import {
  chance,
  intBetween,
  isoMinutesAgo,
  isoMinutesFromNow,
  makeRng,
  pick,
} from "./seed";

const TOTAL_ACCOUNTS = 300;

// Distribution target: mostly healthy, a meaningful slice at risk, a few
// paused / logged out — consistent with a 295/300 "active" operation.
function rollHealthState(rng: () => number): HealthState {
  const r = rng();
  if (r < 0.82) return "healthy"; // ~246
  if (r < 0.95) return "at_risk"; // ~39
  if (r < 0.985) return "paused"; // ~10
  return "logged_out"; // ~5
}

function capFor(rng: () => number, base: number, state: HealthState) {
  // At-risk / paused accounts have throttled-down usage.
  const throttle =
    state === "healthy" ? 1 : state === "at_risk" ? 0.55 : state === "paused" ? 0.15 : 0;
  const cap = base + intBetween(rng, -3, 3);
  const used = Math.round(cap * throttle * (0.4 + rng() * 0.6));
  return { used: Math.min(used, cap), cap };
}

function buildAccount(rng: () => number, index: number): AccountHealth {
  const first = pick(rng, FIRST_NAMES);
  const last = pick(rng, LAST_NAMES);
  const state = rollHealthState(rng);

  const isOnline = state === "healthy" || state === "at_risk";

  const cooldownUntil =
    state === "paused"
      ? isoMinutesFromNow(intBetween(rng, 90, 720))
      : state === "at_risk" && chance(rng, 0.4)
        ? isoMinutesFromNow(intBetween(rng, 20, 180))
        : null;

  // SSI is a weekly lagging metric (Social Selling Index, 0–100).
  const ssi =
    state === "logged_out" ? null : intBetween(rng, 38, 86);

  const lastActionAt =
    state === "logged_out"
      ? isoMinutesAgo(intBetween(rng, 600, 3000))
      : isoMinutesAgo(intBetween(rng, 1, 220));

  const lastSyncedAt =
    state === "logged_out"
      ? isoMinutesAgo(intBetween(rng, 240, 1200))
      : isoMinutesAgo(intBetween(rng, 2, 45));

  return {
    accountId: `acc_${String(index + 1).padStart(4, "0")}`,
    displayName: `${first} ${last}`,
    proxyRegion: pick(rng, PROXY_REGIONS),
    healthState: state,
    cooldownUntil,
    ssi,
    capsToday: {
      connect: capFor(rng, isOnline ? 20 : 0, state),
      like: capFor(rng, isOnline ? 35 : 0, state),
      comment: capFor(rng, isOnline ? 12 : 0, state),
      follow: capFor(rng, isOnline ? 18 : 0, state),
      reply: capFor(rng, isOnline ? 25 : 0, state),
    },
    lastActionAt,
    lastSyncedAt,
  };
}

export const accounts: AccountHealth[] = (() => {
  const rng = makeRng(0xa11ce);
  const list: AccountHealth[] = [];
  for (let i = 0; i < TOTAL_ACCOUNTS; i++) {
    list.push(buildAccount(rng, i));
  }
  return list;
})();

export const activeAccountCount = accounts.filter(
  (a) => a.healthState === "healthy" || a.healthState === "at_risk",
).length;

export const totalAccountCount = accounts.length;

// Drilldown helpers used on the Account Health screen.
export const atRiskAccounts = accounts
  .filter((a) => a.healthState === "at_risk" || a.healthState === "paused")
  .slice()
  .sort((a, b) => (a.ssi ?? 0) - (b.ssi ?? 0));

export const topReplyAccounts = accounts
  .slice()
  .sort((a, b) => b.capsToday.reply.used - a.capsToday.reply.used)
  .slice(0, 8);
