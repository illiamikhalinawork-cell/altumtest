import { useMemo, useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Check,
  Rocket,
  Clock3,
  Moon,
  Gauge,
  Users,
  Shuffle,
  CircleHelp,
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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HEALTH_META } from "@/components/HealthIndicators";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const EXPECTED_COLUMNS = ["Name", "Company", "Title", "LinkedIn URL"];

const SAMPLE_ROWS = [
  { name: "Priya Anderson", company: "Lattice AI", title: "VP Sales" },
  { name: "Marcus Lee", company: "Vantage Robotics", title: "Head of Growth" },
  { name: "Elena Cruz", company: "Brightline Fintech", title: "COO" },
  { name: "Hugo Nielsen", company: "Tideway Shipping", title: "Director of Ops" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CampaignsScreen({ accounts }: { accounts: AccountHealth[] }) {
  const [name, setName] = useState("Q3 — Logistics Expansion");
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    accounts
      .filter((a) => a.healthState === "healthy")
      .slice(0, 24)
      .forEach((a) => s.add(a.accountId));
    return s;
  });
  const [dailyMin, setDailyMin] = useState(15);
  const [dailyMax, setDailyMax] = useState(20);
  const [gapMin, setGapMin] = useState(3);
  const [gapMax, setGapMax] = useState(7);
  const [sleepDays, setSleepDays] = useState<Set<string>>(
    () => new Set(["Sat", "Sun"]),
  );

  const eligible = useMemo(
    () => accounts.filter((a) => a.healthState === "healthy"),
    [accounts],
  );
  const pool = eligible.slice(0, 48);

  const dailyCapacity = selected.size * Math.round((dailyMin + dailyMax) / 2);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSleep = (d: string) => {
    setSleepDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Deploy Campaign"
        description="Upload a target list, assign accounts, and set humanized spread before launch."
        actions={
          <>
            <Button variant="ghost">Save draft</Button>
            <Button variant="primary" className="gap-1.5">
              <Rocket className="h-4 w-4" /> Launch campaign
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column: name + upload */}
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-zinc-500">
                  Campaign name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q3 — Logistics Expansion"
                />
              </div>
            </CardContent>
          </Card>

          {/* CSV upload */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Target list</CardTitle>
                <CardDescription>
                  Upload a CSV of prospects. Required columns shown below.
                </CardDescription>
              </div>
              <Badge variant="muted">{SAMPLE_ROWS.length}-row preview</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Drop zone (non-functional) */}
              <div
                className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-2/40 px-6 py-8 text-center transition-colors hover:border-accent/40 hover:bg-surface-2"
                role="button"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
                  <UploadCloud className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm font-medium text-zinc-200">
                  Drop your CSV here, or click to browse
                </p>
                <p className="mt-0.5 text-2xs text-zinc-500">
                  Up to 25,000 rows · UTF-8 · max 10 MB
                </p>
              </div>

              {/* Expected columns */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xs uppercase tracking-wide text-zinc-500">
                  Expected columns
                </span>
                {EXPECTED_COLUMNS.map((c) => (
                  <Badge key={c} variant="outline" className="gap-1">
                    <FileSpreadsheet className="h-3 w-3" /> {c}
                  </Badge>
                ))}
              </div>

              {/* Preview table */}
              <div className="overflow-hidden rounded-lg border border-line">
                <table className="w-full text-xs">
                  <thead className="bg-surface-2/60">
                    <tr className="text-left text-2xs uppercase tracking-wide text-zinc-500">
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Company</th>
                      <th className="px-3 py-2 font-semibold">Title</th>
                      <th className="px-3 py-2 font-semibold">LinkedIn URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map((r) => (
                      <tr
                        key={r.name}
                        className="border-t border-line-soft text-zinc-300"
                      >
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2 text-zinc-400">{r.company}</td>
                        <td className="px-3 py-2 text-zinc-400">{r.title}</td>
                        <td className="px-3 py-2">
                          <span className="font-mono text-2xs text-accent/80">
                            linkedin.com/in/
                            {r.name.toLowerCase().replace(/\s+/g, "-")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-2xs text-zinc-600">
                Mockup · upload is non-functional. Rows above are illustrative.
              </p>
            </CardContent>
          </Card>

          {/* Account selection */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-accent" /> Assign accounts
                </CardTitle>
                <CardDescription>
                  Pick from the healthy pool · {selected.size} selected of{" "}
                  {eligible.length} eligible
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setSelected(new Set(pool.map((a) => a.accountId)))
                  }
                >
                  Select all
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set())}
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                {pool.map((a) => {
                  const isSel = selected.has(a.accountId);
                  return (
                    <button
                      key={a.accountId}
                      onClick={() => toggle(a.accountId)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                        isSel
                          ? "border-accent/40 bg-accent/10"
                          : "border-line bg-surface-2/40 hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-semibold",
                          isSel
                            ? "bg-accent text-zinc-950"
                            : "bg-zinc-800 text-zinc-400",
                        )}
                      >
                        {isSel ? <Check className="h-3 w-3" /> : initials(a.displayName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs text-zinc-200">
                          {a.displayName}
                        </span>
                        <span className="block truncate text-[10px] text-zinc-600">
                          {a.proxyRegion}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          HEALTH_META[a.healthState].cell,
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: spread settings + summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Shuffle className="h-4 w-4 text-accent" /> Spread &amp; humanization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RangeControl
                icon={Gauge}
                label="Invites per account / day"
                min={5}
                max={30}
                low={dailyMin}
                high={dailyMax}
                onLow={setDailyMin}
                onHigh={setDailyMax}
                unit=""
                hint="Recommended 15–20 to stay under limits"
              />
              <RangeControl
                icon={Clock3}
                label="Gap between actions"
                min={1}
                max={15}
                low={gapMin}
                high={gapMax}
                onLow={setGapMin}
                onHigh={setGapMax}
                unit="min"
                hint="Randomized within range per action"
              />
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wide text-zinc-500">
                  <Moon className="h-3.5 w-3.5" /> Sleep days
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((d) => {
                    const on = sleepDays.has(d);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleSleep(d)}
                        className={cn(
                          "h-8 w-10 rounded-md border text-xs font-medium transition-colors",
                          on
                            ? "border-line bg-surface-2 text-zinc-500 line-through"
                            : "border-accent/40 bg-accent/10 text-accent",
                        )}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-600">
                  <CircleHelp className="h-3 w-3" /> Highlighted days are active;
                  struck-through days pause sending.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Launch summary */}
          <Card>
            <CardHeader>
              <CardTitle>Launch summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <SummaryRow label="Campaign" value={name || "Untitled"} />
              <SummaryRow label="Accounts assigned" value={`${selected.size}`} />
              <SummaryRow
                label="Spread"
                value={`${dailyMin}–${dailyMax}/day · ${gapMin}–${gapMax}min gaps`}
              />
              <SummaryRow
                label="Active days"
                value={`${7 - sleepDays.size} / 7`}
              />
              <div className="mt-2 flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                <span className="text-2xs text-zinc-400">Est. daily capacity</span>
                <span className="tabular text-sm font-semibold text-accent">
                  ~{dailyCapacity.toLocaleString()} invites
                </span>
              </div>
              <Button variant="primary" className="mt-1 w-full gap-1.5">
                <Rocket className="h-4 w-4" /> Launch campaign
              </Button>
              <p className="text-center text-[10px] text-zinc-600">
                Mockup · launching is non-functional
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RangeControl({
  icon: Icon,
  label,
  min,
  max,
  low,
  high,
  onLow,
  onHigh,
  unit,
  hint,
}: {
  icon: typeof Gauge;
  label: string;
  min: number;
  max: number;
  low: number;
  high: number;
  onLow: (n: number) => void;
  onHigh: (n: number) => void;
  unit: string;
  hint: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wide text-zinc-500">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="tabular text-xs font-semibold text-zinc-200">
          {low}–{high}
          {unit && <span className="text-zinc-500"> {unit}</span>}
        </span>
      </div>
      <div className="space-y-2">
        <RangeSlider min={min} max={max} value={low} onChange={(v) => onLow(Math.min(v, high))} />
        <RangeSlider min={min} max={max} value={high} onChange={(v) => onHigh(Math.max(v, low))} />
      </div>
      <p className="mt-1 text-[10px] text-zinc-600">{hint}</p>
    </div>
  );
}

function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-accent
        [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow"
      style={{
        background: `linear-gradient(to right, #22d3ee ${p}%, #27272a ${p}%)`,
      }}
    />
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="truncate text-right font-medium text-zinc-200">{value}</span>
    </div>
  );
}
