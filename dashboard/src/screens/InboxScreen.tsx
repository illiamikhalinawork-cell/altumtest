import { useMemo, useState } from "react";
import { Search, Flame, Inbox as InboxIcon } from "lucide-react";
import type { InboxRow } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { SentimentBadge } from "@/components/HealthIndicators";
import { ThreadPanel } from "@/components/ThreadPanel";
import { ReviewQueuePanel } from "@/components/ReviewQueuePanel";
import {
  accountSources,
  inboxRows,
  messagesByConversation,
} from "@/mock/inbox";
import { reviewQueue } from "@/mock/reviewQueue";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Filter = "all" | "unread" | "hot";

export function InboxScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [account, setAccount] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inboxRows.filter((r) => {
      if (filter === "unread" && r.isRead) return false;
      if (filter === "hot" && !r.hotLead) return false;
      if (account !== "all" && r.accountSource !== account) return false;
      if (!q) return true;
      return (
        r.senderName.toLowerCase().includes(q) ||
        (r.senderCompany ?? "").toLowerCase().includes(q) ||
        r.preview.toLowerCase().includes(q)
      );
    });
  }, [query, filter, account]);

  const selected = selectedId
    ? inboxRows.find((r) => r.conversationId === selectedId) ?? null
    : null;

  const counts = {
    all: inboxRows.length,
    unread: inboxRows.filter((r) => !r.isRead).length,
    hot: inboxRows.filter((r) => r.hotLead).length,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Unified Inbox"
        description="Every conversation across all 300 accounts in one thread-aware view."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <InboxIcon className="h-3 w-3" /> {counts.all} conversations
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* Left: table + (optional) thread overlay */}
        <div className="space-y-3">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sender, company, or message…"
                className="pl-9"
              />
            </div>
            <Tabs
              items={[
                { id: "all", label: "All", count: counts.all },
                { id: "unread", label: "Unread", count: counts.unread },
                { id: "hot", label: "Hot", count: counts.hot },
              ]}
              value={filter}
              onChange={(id) => setFilter(id as Filter)}
            />
            <Select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="text-xs"
            >
              <option value="all">All accounts</option>
              {accountSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <Card className="overflow-hidden">
            <div className="max-h-[calc(100vh-360px)] min-h-[420px] overflow-y-auto">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH className="w-[180px]">Sender Name</TH>
                    <TH className="w-[150px]">Company</TH>
                    <TH>Message preview</TH>
                    <TH className="w-[96px]">Time received</TH>
                    <TH className="w-[110px]">Sentiment</TH>
                    <TH className="w-[150px]">Account source</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <InboxTableRow
                      key={r.conversationId}
                      row={r}
                      selected={r.conversationId === selectedId}
                      onClick={() => setSelectedId(r.conversationId)}
                    />
                  ))}
                  {rows.length === 0 && (
                    <TR className="hover:bg-transparent">
                      <TD colSpan={6} className="py-10 text-center text-zinc-500">
                        No conversations match these filters.
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Right: thread detail OR review queue */}
        <div className="space-y-4">
          {selected ? (
            <Card className="overflow-hidden">
              <div className="h-[calc(100vh-200px)] min-h-[560px]">
                <ThreadPanel
                  row={selected}
                  messages={messagesByConversation[selected.conversationId] ?? []}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            </Card>
          ) : (
            <ReviewQueuePanel drafts={reviewQueue} />
          )}
        </div>
      </div>
    </div>
  );
}

function InboxTableRow({
  row,
  selected,
  onClick,
}: {
  row: InboxRow;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <TR
      onClick={onClick}
      className={cn(
        "cursor-pointer",
        selected ? "bg-surface-2" : "hover:bg-surface-2/60",
      )}
    >
      <TD>
        <div className="flex items-center gap-2">
          {!row.isRead && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          )}
          <span
            className={cn(
              "truncate",
              row.isRead ? "text-zinc-300" : "font-semibold text-zinc-100",
            )}
          >
            {row.senderName}
          </span>
          {row.hotLead && (
            <Flame className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          )}
        </div>
      </TD>
      <TD className="truncate text-zinc-400">{row.senderCompany ?? "—"}</TD>
      <TD>
        <span
          className={cn(
            "line-clamp-1 text-xs",
            row.isRead ? "text-zinc-500" : "text-zinc-300",
          )}
        >
          {row.preview}
        </span>
      </TD>
      <TD className="whitespace-nowrap text-2xs text-zinc-500">
        {formatRelativeTime(row.lastMessageAt)}
      </TD>
      <TD>
        <SentimentBadge sentiment={row.sentiment} />
      </TD>
      <TD className="truncate text-2xs text-zinc-400">{row.accountSource}</TD>
    </TR>
  );
}
