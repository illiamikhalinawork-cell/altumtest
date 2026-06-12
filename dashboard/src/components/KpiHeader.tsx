import {
  Send,
  UserPlus,
  CheckCircle2,
  MessageSquareReply,
  Server,
  Flame,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { KpiSnapshot } from "@/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

interface Tile {
  key: keyof KpiSnapshot | "active";
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "accent" | "amber" | "emerald";
  emphasize?: boolean;
}

export function KpiHeader({
  kpi,
  lastTickAt,
}: {
  kpi: KpiSnapshot;
  lastTickAt: number;
}) {
  const tiles: Tile[] = [
    {
      key: "messagesSentToday",
      label: "Messages sent today",
      value: formatNumber(kpi.messagesSentToday),
      sub: "across all accounts",
      icon: Send,
      emphasize: true,
    },
    {
      key: "connectionsSentToday",
      label: "Connections sent",
      value: formatNumber(kpi.connectionsSentToday),
      sub: `${formatNumber(kpi.acceptedToday)} accepted`,
      icon: UserPlus,
    },
    {
      key: "acceptedToday",
      label: "Accepted today",
      value: formatNumber(kpi.acceptedToday),
      sub: "invites confirmed",
      icon: CheckCircle2,
    },
    {
      key: "repliesReceivedToday",
      label: "Replies received",
      value: formatNumber(kpi.repliesReceivedToday),
      sub: "inbound today",
      icon: MessageSquareReply,
      emphasize: true,
    },
    {
      key: "active",
      label: "Active accounts",
      value: `${kpi.activeAccounts}/${kpi.totalAccounts}`,
      sub: "warming & live",
      icon: Server,
      tone: "emerald",
    },
    {
      key: "hotLeads",
      label: "Hot leads",
      value: formatNumber(kpi.hotLeads),
      sub: "flagged for follow-up",
      icon: Flame,
      tone: "amber",
      emphasize: true,
    },
    {
      key: "reviewQueueDepth",
      label: "Review queue",
      value: formatNumber(kpi.reviewQueueDepth),
      sub: "AI drafts pending",
      icon: ClipboardCheck,
      tone: "amber",
    },
  ];

  return (
    <header className="border-b border-line bg-surface/60 backdrop-blur">
      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center gap-2 text-2xs text-zinc-500">
          <LiveDot tick={lastTickAt} />
          <span>Live · synced just now</span>
        </div>
        <div className="text-2xs text-zinc-600">
          Operator: ops@northwind · UTC-04 · {new Date().toLocaleDateString()}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px px-5 py-3 sm:grid-cols-4 xl:grid-cols-7">
        {tiles.map((t) => (
          <KpiTile key={t.key} tile={t} />
        ))}
      </div>
    </header>
  );
}

function KpiTile({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const toneText =
    tile.tone === "amber"
      ? "text-amber-400"
      : tile.tone === "emerald"
        ? "text-emerald-400"
        : "text-accent";
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-line hover:bg-surface-2",
      )}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", toneText)} />
        <span className="truncate text-2xs font-medium uppercase tracking-wide text-zinc-500">
          {tile.label}
        </span>
      </div>
      <div
        className={cn(
          "tabular font-semibold tracking-tight text-zinc-100",
          tile.emphasize ? "text-2xl" : "text-xl",
        )}
      >
        {tile.value}
      </div>
      {tile.sub && (
        <div className="mt-0.5 text-2xs text-zinc-600">{tile.sub}</div>
      )}
    </div>
  );
}

function LiveDot({ tick }: { tick: number }) {
  // Re-key on tick so the ring flashes each update.
  return (
    <span key={tick} className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}
