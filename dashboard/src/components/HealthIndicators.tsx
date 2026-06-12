import type { HealthState, Sentiment } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { pct } from "@/lib/format";

export const HEALTH_META: Record<
  HealthState,
  { label: string; variant: "success" | "warning" | "danger" | "muted"; cell: string }
> = {
  healthy: { label: "Healthy", variant: "success", cell: "bg-emerald-500" },
  at_risk: { label: "At risk", variant: "warning", cell: "bg-amber-500" },
  paused: { label: "Paused", variant: "muted", cell: "bg-zinc-600" },
  logged_out: { label: "Logged out", variant: "danger", cell: "bg-rose-500" },
};

export function HealthBadge({ state }: { state: HealthState }) {
  const m = HEALTH_META[state];
  return (
    <Badge variant={m.variant} dot>
      {m.label}
    </Badge>
  );
}

const SENTIMENT_META: Record<
  Exclude<Sentiment, null>,
  { label: string; variant: "success" | "muted" | "danger" }
> = {
  positive: { label: "Positive", variant: "success" },
  neutral: { label: "Neutral", variant: "muted" },
  negative: { label: "Negative", variant: "danger" },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  if (!sentiment)
    return <span className="text-2xs text-zinc-600">—</span>;
  const m = SENTIMENT_META[sentiment];
  return (
    <Badge variant={m.variant} dot>
      {m.label}
    </Badge>
  );
}

export function CapBar({
  label,
  used,
  cap,
}: {
  label: string;
  used: number;
  cap: number;
}) {
  const p = pct(used, cap);
  const tone =
    p >= 90 ? "bg-rose-500" : p >= 70 ? "bg-amber-500" : "bg-accent";
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-2xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${p}%` }}
        />
      </div>
      <span className="w-12 text-right text-2xs tabular text-zinc-400">
        {used}/{cap}
      </span>
    </div>
  );
}
