import {
  LayoutDashboard,
  Inbox,
  HeartPulse,
  Rocket,
  Activity,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { ScreenId } from "@/types";
import { cn } from "@/lib/cn";

interface NavItem {
  id: ScreenId;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface SidebarProps {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
  reviewQueueDepth: number;
  unread: number;
}

export function Sidebar({
  active,
  onNavigate,
  reviewQueueDepth,
  unread,
}: SidebarProps) {
  const items: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inbox", label: "Unified Inbox", icon: Inbox, badge: unread },
    { id: "health", label: "Account Health", icon: HeartPulse },
    { id: "campaigns", label: "Campaigns", icon: Rocket },
  ];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-surface">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 ring-1 ring-accent/30">
          <Activity className="h-4 w-4 text-accent" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-100">
            Outreach Console
          </div>
          <div className="text-2xs text-zinc-500">LinkedIn Automation Agent</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-3">
        <div className="px-2 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-zinc-600">
          Operate
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-surface-2 text-zinc-100"
                  : "text-zinc-400 hover:bg-surface-2 hover:text-zinc-200",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-accent" : "text-zinc-500",
                )}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="rounded bg-accent/15 px-1.5 text-2xs font-medium tabular text-accent">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Review-queue trust callout */}
      <div className="mx-2.5 mb-3 rounded-lg border border-line bg-surface-2 p-3">
        <div className="mb-1 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <span className="text-2xs font-semibold uppercase tracking-wide text-zinc-300">
            Human review
          </span>
        </div>
        <p className="text-2xs leading-relaxed text-zinc-500">
          AI drafts default to manual approval.
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xs text-zinc-500">In queue</span>
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-2xs font-medium tabular text-amber-400">
            {reviewQueueDepth} drafts
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-line px-2.5 py-2.5">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-500 transition-colors hover:bg-surface-2 hover:text-zinc-300">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
