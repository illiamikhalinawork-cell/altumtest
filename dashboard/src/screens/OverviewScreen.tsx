import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CircleDot,
  Flame,
  MessageSquareReply,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { AccountHealth } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { FunnelChart } from "@/components/FunnelChart";
import { HealthHeatmap, HeatmapLegend } from "@/components/HealthHeatmap";
import {
  campaignFunnels,
  campaignOptions,
  initialFunnel,
  sendTrend,
} from "@/mock/metrics";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const ACTIVITY: {
  id: string;
  kind: "reply" | "accepted" | "sent" | "risk" | "hot";
  text: string;
  meta: string;
  minsAgo: number;
}[] = [
  { id: "a1", kind: "hot", text: "Hot lead flagged — Priya Anderson (Lattice AI)", meta: "James Carter", minsAgo: 1 },
  { id: "a2", kind: "reply", text: "Reply received — “let’s set up 20 minutes next week”", meta: "Olivia Reed", minsAgo: 3 },
  { id: "a3", kind: "accepted", text: "Connection accepted by Marcus Lee (Vantage Robotics)", meta: "Noah Bennett", minsAgo: 6 },
  { id: "a4", kind: "sent", text: "AI follow-up sent (approved) to 4 conversations", meta: "Review queue", minsAgo: 9 },
  { id: "a5", kind: "risk", text: "Account moved to AT RISK — elevated invite decline rate", meta: "acc_0142", minsAgo: 14 },
  { id: "a6", kind: "accepted", text: "Connection accepted by Elena Cruz (Brightline Fintech)", meta: "Maya Patel", minsAgo: 18 },
  { id: "a7", kind: "reply", text: "Reply received — pricing question for team of 40", meta: "Hugo Nielsen", minsAgo: 24 },
  { id: "a8", kind: "sent", text: "Cooldown started on 2 accounts (daily cap reached)", meta: "Scheduler", minsAgo: 31 },
];

const ACTIVITY_ICON = {
  reply: MessageSquareReply,
  accepted: CheckCircle2,
  sent: UserPlus,
  risk: AlertTriangle,
  hot: Flame,
} as const;

const ACTIVITY_TONE = {
  reply: "text-emerald-400",
  accepted: "text-accent",
  sent: "text-zinc-400",
  risk: "text-amber-400",
  hot: "text-amber-400",
} as const;

export function OverviewScreen({ accounts }: { accounts: AccountHealth[] }) {
  const [campaign, setCampaign] = useState("all");

  const funnel =
    campaign === "all" ? initialFunnel : campaignFunnels[campaign] ?? initialFunnel;

  const acceptRate = useMemo(
    () => ((funnel.accepted / Math.max(1, funnel.sent)) * 100).toFixed(1),
    [funnel],
  );
  const replyRate = useMemo(
    () => ((funnel.replied / Math.max(1, funnel.accepted)) * 100).toFixed(1),
    [funnel],
  );

  // Health preview = a representative slice of the fleet.
  const preview = accounts.slice(0, 120);
  const counts = useMemo(() => {
    const c = { healthy: 0, at_risk: 0, paused: 0, logged_out: 0 };
    for (const a of accounts) c[a.healthState] += 1;
    return c;
  }, [accounts]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Overview"
        description="Fleet-wide operating picture for today’s outreach run."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <CircleDot className="h-3 w-3 text-emerald-400" />
            All campaigns running
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Funnel */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Connection funnel</CardTitle>
              <CardDescription>
                pending → queued → sent → accepted → replied → dead ·{" "}
                <span className="text-zinc-400">
                  {formatNumber(funnel.pending)} pending
                </span>{" "}
                ·{" "}
                <span className="text-accent">
                  {formatNumber(funnel.accepted)} accepted
                </span>{" "}
                ·{" "}
                <span className="text-emerald-400">
                  {formatNumber(funnel.replied)} replied
                </span>
              </CardDescription>
            </div>
            <Select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="h-8 text-xs"
            >
              {campaignOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Select>
          </CardHeader>
          <CardContent>
            <FunnelChart funnel={funnel} />
            <div className="mt-3 grid grid-cols-4 gap-3 border-t border-line-soft pt-3">
              <Stat label="Accept rate" value={`${acceptRate}%`} tone="accent" />
              <Stat label="Reply rate" value={`${replyRate}%`} tone="emerald" />
              <Stat label="Failed" value={formatNumber(funnel.failed)} tone="rose" />
              <Stat label="Skipped" value={formatNumber(funnel.skipped)} />
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <Badge variant="muted">live</Badge>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            <ul className="divide-y divide-line-soft">
              {ACTIVITY.map((a) => {
                const Icon = ACTIVITY_ICON[a.kind];
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-surface-2"
                  >
                    <Icon
                      className={cn("mt-0.5 h-4 w-4 shrink-0", ACTIVITY_TONE[a.kind])}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-zinc-300">{a.text}</p>
                      <p className="text-2xs text-zinc-600">
                        {a.meta} · {formatRelativeTime(
                          new Date(Date.now() - a.minsAgo * 60000).toISOString(),
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Throughput · last 14 days</CardTitle>
              <CardDescription>
                Messages sent vs. replies received, per day
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-2xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" /> Sent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Replies
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={sendTrend}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
                <defs>
                  <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e1e22" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  interval={1}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#16161a",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sent"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#gSent)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="replies"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#gRep)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health preview */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Account health</CardTitle>
              <CardDescription>
                {counts.healthy} healthy · {counts.at_risk} at risk ·{" "}
                {counts.paused + counts.logged_out} offline
              </CardDescription>
            </div>
            <a className="flex cursor-default items-center gap-0.5 text-2xs text-accent">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="space-y-3">
            <HealthHeatmap accounts={preview} size="sm" />
            <HeatmapLegend />
            <p className="text-2xs text-zinc-600">
              Showing 120 of {accounts.length} accounts. Cells recolor live as the
              scheduler reacts to caps and decline rates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent" | "emerald" | "rose";
}) {
  const toneText =
    tone === "accent"
      ? "text-accent"
      : tone === "emerald"
        ? "text-emerald-400"
        : tone === "rose"
          ? "text-rose-400"
          : "text-zinc-200";
  return (
    <div>
      <div className="text-2xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={cn("tabular text-lg font-semibold", toneText)}>{value}</div>
    </div>
  );
}
