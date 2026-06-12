import { ShieldCheck, Check, X, Pencil, Bot } from "lucide-react";
import type { ReviewDraft } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/format";

export function ReviewQueuePanel({ drafts }: { drafts: ReviewDraft[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-accent" /> Review queue
          </CardTitle>
          <CardDescription>
            AI drafts pending human approval · approval-by-default trust model
          </CardDescription>
        </div>
        <Badge variant="warning">{drafts.length} pending</Badge>
      </CardHeader>
      <CardContent className="space-y-2.5 p-3">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="rounded-lg border border-line bg-surface-2/50 p-3"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-zinc-200">
                  {d.senderName}
                  {d.senderCompany && (
                    <span className="text-zinc-500"> · {d.senderCompany}</span>
                  )}
                </div>
                <div className="text-2xs text-zinc-600">
                  via {d.accountSource} · {formatRelativeTime(d.createdAt)}
                </div>
              </div>
              <Badge variant="accent" className="shrink-0">
                {d.intent}
              </Badge>
            </div>
            <p className="mb-2 line-clamp-2 text-2xs leading-relaxed text-zinc-400">
              <Bot className="mr-1 inline h-3 w-3 text-accent/80" />
              {d.draftBody}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xs text-zinc-600">
                model confidence {(d.confidence * 100).toFixed(0)}%
              </span>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" className="h-6 px-2">
                  <X className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 px-2">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="primary" className="h-6 gap-1 px-2">
                  <Check className="h-3 w-3" /> Approve
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
