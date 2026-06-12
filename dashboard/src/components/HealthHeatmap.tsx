import type { AccountHealth } from "@/types";
import { HEALTH_META } from "./HealthIndicators";
import { cn } from "@/lib/cn";

interface HeatmapProps {
  accounts: AccountHealth[];
  pulsedIds?: Set<string>;
  onSelect?: (account: AccountHealth) => void;
  selectedId?: string | null;
  size?: "sm" | "md";
}

// Dense green/amber/grey/red grid. One cell per account.
export function HealthHeatmap({
  accounts,
  pulsedIds,
  onSelect,
  selectedId,
  size = "md",
}: HeatmapProps) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex flex-wrap gap-1">
      {accounts.map((a) => {
        const meta = HEALTH_META[a.healthState];
        const pulsed = pulsedIds?.has(a.accountId);
        const selected = selectedId === a.accountId;
        return (
          <button
            key={a.accountId}
            onClick={() => onSelect?.(a)}
            title={`${a.displayName} · ${meta.label} · ${a.proxyRegion}`}
            className={cn(
              "rounded-[3px] transition-transform hover:scale-125 hover:ring-1 hover:ring-white/40",
              dim,
              meta.cell,
              a.healthState === "paused" && "opacity-50",
              pulsed && "animate-flash ring-1 ring-accent",
              selected && "ring-2 ring-white scale-110",
            )}
          />
        );
      })}
    </div>
  );
}

export function HeatmapLegend() {
  const items: { label: string; cls: string }[] = [
    { label: "Healthy", cls: "bg-emerald-500" },
    { label: "At risk", cls: "bg-amber-500" },
    { label: "Paused", cls: "bg-zinc-600" },
    { label: "Logged out", cls: "bg-rose-500" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-[2px]", i.cls)} />
          <span className="text-2xs text-zinc-500">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
