import { useMemo, useState } from "react";
import { Search, TrendingUp, ShieldAlert, ChevronRight } from "lucide-react";
import type { AccountHealth, HealthState } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { HealthHeatmap, HeatmapLegend } from "@/components/HealthHeatmap";
import { AccountDetailPanel } from "@/components/AccountDetailPanel";
import { HEALTH_META } from "@/components/HealthIndicators";
import { formatRelativeTime, initials } from "@/lib/format";
import { cn } from "@/lib/cn";

type StateFilter = "all" | HealthState;

export function HealthScreen({
  accounts,
  pulsedIds,
}: {
  accounts: AccountHealth[];
  pulsedIds: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    accounts[0]?.accountId ?? null,
  );

  const counts = useMemo(() => {
    const c = { healthy: 0, at_risk: 0, paused: 0, logged_out: 0 };
    for (const a of accounts) c[a.healthState] += 1;
    return c;
  }, [accounts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (stateFilter !== "all" && a.healthState !== stateFilter) return false;
      if (!q) return true;
      return (
        a.displayName.toLowerCase().includes(q) ||
        a.proxyRegion.toLowerCase().includes(q) ||
        a.accountId.toLowerCase().includes(q)
      );
    });
  }, [accounts, query, stateFilter]);

  // Drilldowns.
  const mostReplies = useMemo(
    () =>
      accounts
        .filter((a) => a.healthState !== "logged_out")
        .slice()
        .sort((a, b) => b.capsToday.reply.used - a.capsToday.reply.used)
        .slice(0, 6),
    [accounts],
  );
  const atBanRisk = useMemo(
    () =>
      accounts
        .filter((a) => a.healthState === "at_risk" || a.healthState === "paused")
        .slice()
        .sort((a, b) => (a.ssi ?? 0) - (b.ssi ?? 0))
        .slice(0, 6),
    [accounts],
  );

  const selected = selectedId
    ? accounts.find((a) => a.accountId === selectedId) ?? null
    : null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Account Health"
        description="Green / amber / red status across all 300 warmed accounts. Cells recolor live."
        actions={
          <div className="flex items-center gap-2">
            {(["healthy", "at_risk", "paused", "logged_out"] as HealthState[]).map(
              (s) => (
                <Badge key={s} variant={HEALTH_META[s].variant} dot>
                  {counts[s]} {HEALTH_META[s].label.toLowerCase()}
                </Badge>
              ),
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* Heatmap */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Fleet heatmap</CardTitle>
                <CardDescription>
                  {filtered.length} of {accounts.length} accounts shown · click a
                  cell to inspect
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-44">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs
                items={[
                  { id: "all", label: "All", count: accounts.length },
                  { id: "healthy", label: "Healthy", count: counts.healthy },
                  { id: "at_risk", label: "At risk", count: counts.at_risk },
                  { id: "paused", label: "Paused", count: counts.paused },
                  { id: "logged_out", label: "Logged out", count: counts.logged_out },
                ]}
                value={stateFilter}
                onChange={(id) => setStateFilter(id as StateFilter)}
              />
              <div className="rounded-lg border border-line-soft bg-canvas/40 p-3">
                <HealthHeatmap
                  accounts={filtered}
                  pulsedIds={pulsedIds}
                  selectedId={selectedId}
                  onSelect={(a) => setSelectedId(a.accountId)}
                />
              </div>
              <HeatmapLegend />
            </CardContent>
          </Card>

          {/* Drilldowns */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DrilldownCard
              title="Most replies today"
              description="Top performers by inbound reply volume"
              icon={TrendingUp}
              tone="emerald"
              accounts={mostReplies}
              metric={(a) => `${a.capsToday.reply.used} replies`}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
            <DrilldownCard
              title="At ban risk"
              description="Lowest SSI among at-risk / paused accounts"
              icon={ShieldAlert}
              tone="amber"
              accounts={atBanRisk}
              metric={(a) => `SSI ${a.ssi ?? "—"}`}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
          </div>
        </div>

        {/* Detail */}
        <div>
          <AccountDetailPanel account={selected} />
        </div>
      </div>
    </div>
  );
}

function DrilldownCard({
  title,
  description,
  icon: Icon,
  tone,
  accounts,
  metric,
  onSelect,
  selectedId,
}: {
  title: string;
  description: string;
  icon: typeof TrendingUp;
  tone: "emerald" | "amber";
  accounts: AccountHealth[];
  metric: (a: AccountHealth) => string;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const toneText = tone === "emerald" ? "text-emerald-400" : "text-amber-400";
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <Icon className={cn("h-4 w-4", toneText)} /> {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-line-soft">
          {accounts.map((a) => (
            <li key={a.accountId}>
              <button
                onClick={() => onSelect(a.accountId)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2",
                  selectedId === a.accountId && "bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-2xs font-semibold text-zinc-300 ring-1",
                    a.healthState === "at_risk"
                      ? "ring-amber-500/40"
                      : a.healthState === "paused"
                        ? "ring-zinc-600"
                        : "ring-line",
                  )}
                >
                  {initials(a.displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-zinc-200">
                    {a.displayName}
                  </div>
                  <div className="truncate text-2xs text-zinc-600">
                    {a.proxyRegion} · {formatRelativeTime(a.lastActionAt)}
                  </div>
                </div>
                <span className={cn("shrink-0 tabular text-2xs font-medium", toneText)}>
                  {metric(a)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
