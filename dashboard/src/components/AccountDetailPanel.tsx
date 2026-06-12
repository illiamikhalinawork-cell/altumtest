import {
  MapPin,
  Clock,
  RefreshCw,
  Gauge,
  Snowflake,
  Activity,
} from "lucide-react";
import type { AccountHealth } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HealthBadge, CapBar } from "@/components/HealthIndicators";
import { formatRelativeTime, initials } from "@/lib/format";

export function AccountDetailPanel({
  account,
}: {
  account: AccountHealth | null;
}) {
  if (!account) {
    return (
      <Card className="flex h-full items-center justify-center">
        <div className="px-6 py-12 text-center">
          <Gauge className="mx-auto mb-2 h-6 w-6 text-zinc-600" />
          <p className="text-sm text-zinc-400">Select an account</p>
          <p className="mt-1 text-2xs text-zinc-600">
            Click any cell in the heatmap to inspect caps, cooldown, and SSI.
          </p>
        </div>
      </Card>
    );
  }

  const caps = account.capsToday;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-zinc-300 ring-1 ring-line">
            {initials(account.displayName)}
          </div>
          <div>
            <CardTitle>{account.displayName}</CardTitle>
            <div className="mt-0.5 font-mono text-2xs text-zinc-600">
              {account.accountId}
            </div>
          </div>
        </div>
        <HealthBadge state={account.healthState} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meta */}
        <div className="grid grid-cols-1 gap-2 text-2xs">
          <MetaRow
            icon={MapPin}
            label="Proxy region"
            value={account.proxyRegion}
          />
          <MetaRow
            icon={Activity}
            label="Last action"
            value={formatRelativeTime(account.lastActionAt)}
          />
          <MetaRow
            icon={RefreshCw}
            label="Last synced"
            value={formatRelativeTime(account.lastSyncedAt)}
          />
          <MetaRow
            icon={Snowflake}
            label="Cooldown until"
            value={
              account.cooldownUntil
                ? formatRelativeTime(account.cooldownUntil)
                : "no active cooldown"
            }
            highlight={!!account.cooldownUntil}
          />
        </div>

        {/* SSI — weekly lagging metric */}
        <div className="rounded-lg border border-line bg-surface-2/50 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-2xs uppercase tracking-wide text-zinc-500">
              <Gauge className="h-3.5 w-3.5" /> Social Selling Index
            </span>
            <Badge variant="muted">weekly · lagging</Badge>
          </div>
          {account.ssi !== null ? (
            <div className="flex items-end gap-2">
              <span className="tabular text-2xl font-semibold text-zinc-100">
                {account.ssi}
              </span>
              <span className="mb-1 text-2xs text-zinc-600">/ 100</span>
            </div>
          ) : (
            <span className="text-sm text-zinc-500">Unavailable (logged out)</span>
          )}
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${account.ssi ?? 0}%` }}
            />
          </div>
        </div>

        {/* Caps today */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-2xs uppercase tracking-wide text-zinc-500">
            <Clock className="h-3.5 w-3.5" /> Caps used today
          </div>
          <div className="space-y-2">
            <CapBar label="Connect" used={caps.connect.used} cap={caps.connect.cap} />
            <CapBar label="Like" used={caps.like.used} cap={caps.like.cap} />
            <CapBar label="Comment" used={caps.comment.used} cap={caps.comment.cap} />
            <CapBar label="Follow" used={caps.follow.used} cap={caps.follow.cap} />
            <CapBar label="Reply" used={caps.reply.used} cap={caps.reply.cap} />
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-line-soft pt-3">
          <Button size="sm" variant="outline" className="flex-1">
            Pause account
          </Button>
          <Button size="sm" variant="secondary" className="flex-1">
            Force resync
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={highlight ? "text-amber-400" : "text-zinc-300"}>
        {value}
      </span>
    </div>
  );
}
