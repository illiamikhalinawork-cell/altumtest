import { useEffect, useState } from "react";
import type { ScreenId } from "@/types";
import { Sidebar } from "@/components/Sidebar";
import { KpiHeader } from "@/components/KpiHeader";
import { OverviewScreen } from "@/screens/OverviewScreen";
import { InboxScreen } from "@/screens/InboxScreen";
import { HealthScreen } from "@/screens/HealthScreen";
import { CampaignsScreen } from "@/screens/CampaignsScreen";
import { useLiveData } from "@/hooks/useLiveData";
import { reviewQueueDepth } from "@/mock/reviewQueue";
import { unreadCount } from "@/mock/inbox";

const VALID: ScreenId[] = ["overview", "inbox", "health", "campaigns"];

function readHashScreen(): ScreenId {
  const h = window.location.hash.replace(/^#\/?/, "") as ScreenId;
  return VALID.includes(h) ? h : "overview";
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(readHashScreen);
  const { kpi, accounts, pulsedIds, lastTickAt } = useLiveData();

  // Hash routing so screenshots can deep-link (#/inbox etc.).
  useEffect(() => {
    const onHash = () => setScreen(readHashScreen());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (id: ScreenId) => {
    window.location.hash = `/${id}`;
    setScreen(id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-zinc-200">
      <Sidebar
        active={screen}
        onNavigate={navigate}
        reviewQueueDepth={reviewQueueDepth}
        unread={unreadCount}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <KpiHeader kpi={kpi} lastTickAt={lastTickAt} />

        <main className="flex-1 overflow-y-auto bg-grid px-5 py-5">
          <div className="mx-auto max-w-[1500px]">
            {screen === "overview" && <OverviewScreen accounts={accounts} />}
            {screen === "inbox" && <InboxScreen />}
            {screen === "health" && (
              <HealthScreen accounts={accounts} pulsedIds={pulsedIds} />
            )}
            {screen === "campaigns" && <CampaignsScreen accounts={accounts} />}
          </div>
        </main>
      </div>
    </div>
  );
}
