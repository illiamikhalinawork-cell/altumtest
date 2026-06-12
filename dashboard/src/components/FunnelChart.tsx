import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FunnelSnapshot } from "@/types";
import { formatNumber } from "@/lib/format";

// Connection funnel: pending → queued → sent → accepted → replied → dead.
const STAGE_COLORS: Record<string, string> = {
  Pending: "#3f3f46",
  Queued: "#52525b",
  Sent: "#0e7490",
  Accepted: "#22d3ee",
  Replied: "#34d399",
  Dead: "#f43f5e",
};

export function FunnelChart({ funnel }: { funnel: FunnelSnapshot }) {
  const data = [
    { stage: "Pending", value: funnel.pending },
    { stage: "Queued", value: funnel.queued },
    { stage: "Sent", value: funnel.sent },
    { stage: "Accepted", value: funnel.accepted },
    { stage: "Replied", value: funnel.replied },
    { stage: "Dead", value: funnel.dead },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
        barCategoryGap={10}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={72}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "#16161a",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#e4e4e7",
          }}
          formatter={(v: number) => [formatNumber(v), "Records"]}
        />
        <Bar dataKey="value" radius={[3, 3, 3, 3]} maxBarSize={26}>
          {data.map((d) => (
            <Cell key={d.stage} fill={STAGE_COLORS[d.stage]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number) => formatNumber(v)}
            className="tabular"
            style={{ fill: "#d4d4d8", fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
