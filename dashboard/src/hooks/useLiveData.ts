import { useEffect, useRef, useState } from "react";
import type { AccountHealth, HealthState, KpiSnapshot } from "@/types";
import { accounts as seedAccounts } from "@/mock/accounts";
import { initialKpi } from "@/mock/metrics";
import { clamp } from "@/lib/format";

// The ONLY dynamic behavior in this mockup: a fake "live" updater that nudges
// a few KPI counters upward and occasionally recolors a health cell, so the
// console feels like it's watching a running operation. No network involved.

const TICK_MS = 2600;

export interface LiveState {
  kpi: KpiSnapshot;
  accounts: AccountHealth[];
  /** accountIds touched on the most recent tick — used to flash cells. */
  pulsedIds: Set<string>;
  lastTickAt: number;
}

const HEALTH_CYCLE: Record<HealthState, HealthState> = {
  healthy: "at_risk",
  at_risk: "healthy",
  paused: "at_risk",
  logged_out: "logged_out",
};

export function useLiveData(): LiveState {
  const [kpi, setKpi] = useState<KpiSnapshot>(initialKpi);
  const [accounts, setAccounts] = useState<AccountHealth[]>(seedAccounts);
  const [pulsedIds, setPulsedIds] = useState<Set<string>>(new Set());
  const [lastTickAt, setLastTickAt] = useState<number>(Date.now());
  const tick = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tick.current += 1;
      const t = tick.current;

      // Nudge KPI counters by small, believable increments.
      setKpi((prev) => {
        const next: KpiSnapshot = { ...prev };
        next.messagesSentToday += Math.floor(Math.random() * 9) + 2;
        next.connectionsSentToday += Math.floor(Math.random() * 6) + 1;
        if (Math.random() < 0.6) next.acceptedToday += Math.floor(Math.random() * 3);
        if (Math.random() < 0.45) next.repliesReceivedToday += 1;
        // Active accounts drift within a tight band around 295/300.
        if (Math.random() < 0.15) {
          next.activeAccounts = clamp(
            next.activeAccounts + (Math.random() < 0.5 ? -1 : 1),
            291,
            298,
          );
        }
        if (Math.random() < 0.08) {
          next.hotLeads = clamp(next.hotLeads + (Math.random() < 0.5 ? -1 : 1), 10, 18);
        }
        return next;
      });

      // Every few ticks, recolor a couple of health cells + bump some caps.
      const pulsed = new Set<string>();
      setAccounts((prev) => {
        const next = prev.slice();
        const touches = 3;
        for (let i = 0; i < touches; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const acct = { ...next[idx] };
          // Occasionally flip health between healthy <-> at_risk.
          if (Math.random() < 0.25 && acct.healthState !== "logged_out") {
            acct.healthState = HEALTH_CYCLE[acct.healthState];
          }
          // Bump a random cap usage up by one (without exceeding cap).
          const keys = ["connect", "like", "comment", "follow", "reply"] as const;
          const k = keys[Math.floor(Math.random() * keys.length)];
          const c = acct.capsToday[k];
          acct.capsToday = {
            ...acct.capsToday,
            [k]: { ...c, used: Math.min(c.cap, c.used + 1) },
          };
          acct.lastActionAt = new Date().toISOString();
          next[idx] = acct;
          pulsed.add(acct.accountId);
        }
        return next;
      });

      setPulsedIds(pulsed);
      setLastTickAt(Date.now());
      void t;
    }, TICK_MS);

    return () => clearInterval(id);
  }, []);

  return { kpi, accounts, pulsedIds, lastTickAt };
}
