import {
  X,
  Sparkles,
  Send,
  Building2,
  AtSign,
  Flame,
  AlertCircle,
  Bot,
  User,
} from "lucide-react";
import type { InboxRow, Message } from "@/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SentimentBadge } from "@/components/HealthIndicators";
import { formatClock, formatRelativeTime, initials } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ThreadPanel({
  row,
  messages,
  onClose,
}: {
  row: InboxRow;
  messages: Message[];
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-zinc-300 ring-1 ring-line">
            {initials(row.senderName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-zinc-100">
                {row.senderName}
              </span>
              {row.hotLead && (
                <Badge variant="warning" className="gap-1">
                  <Flame className="h-3 w-3" /> Hot
                </Badge>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-2xs text-zinc-500">
              {row.senderCompany && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {row.senderCompany}
                </span>
              )}
              <SentimentBadge sentiment={row.sentiment} />
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Account-source banner */}
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/40 px-4 py-2">
        <AtSign className="h-3.5 w-3.5 text-accent" />
        <span className="text-2xs text-zinc-400">
          Conversation handled by{" "}
          <span className="font-medium text-zinc-200">{row.accountSource}</span>{" "}
          · replies send from this account automatically.
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* Composer (non-functional) */}
      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="accent" className="gap-1">
            <Sparkles className="h-3 w-3" /> AI suggested reply
          </Badge>
          <span className="text-2xs text-zinc-500">
            Sends from {row.accountSource}
          </span>
        </div>
        <Textarea
          rows={3}
          readOnly
          value={`Thanks ${row.senderName.split(" ")[0]} — happy to share a one-pager and a relevant case study. Would Thursday at 14:00 work for a quick 15-minute call? I'll keep everything in this thread.`}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xs text-zinc-600">
            Mockup · composer is non-functional
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              Regenerate
            </Button>
            <Button size="sm" variant="primary" className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Approve &amp; send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const outbound = message.direction === "outbound";
  const failed = message.status === "send_failed";
  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[82%]", outbound ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-xs leading-relaxed",
            outbound
              ? "bg-accent/10 text-zinc-100 ring-1 ring-accent/20"
              : "bg-surface-2 text-zinc-200 ring-1 ring-line",
            failed && "ring-rose-500/40",
          )}
        >
          {message.body}
        </div>
        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-2xs text-zinc-600",
            outbound ? "justify-end" : "justify-start",
          )}
        >
          {message.sentBy === "ai" && (
            <span className="flex items-center gap-0.5 text-accent/80">
              <Bot className="h-3 w-3" /> AI
            </span>
          )}
          {message.sentBy === "human" && (
            <span className="flex items-center gap-0.5">
              <User className="h-3 w-3" /> Human
            </span>
          )}
          <span>{formatClock(message.receivedAt)}</span>
          <span>· {formatRelativeTime(message.receivedAt)}</span>
          {failed && (
            <span className="flex items-center gap-0.5 text-rose-400">
              <AlertCircle className="h-3 w-3" /> send failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
