import { useState } from "react";
import { TopBar } from "../../../shared/components/ui";
import LibraryTabs from "./LibraryTabs";
import SummaryList from "./SummaryList";
import MyHighlights from "./MyHighlights";
import { S } from "../../../shared/constants/theme";

const TABS = [{ id: "summaries", label: "الخلاصات" }, { id: "notes", label: "تظليلاتي" }];

// مكتبتي: خلاصات الوحدات المكتملة، وما ظلّله القارئ بنفسه أثناء الدروس
export default function LibraryScreen({ progress, onBack, onOpenUnit }) {
  const [tab, setTab] = useState("summaries");
  const ids = Object.keys(progress);
  return (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title="مكتبتي" onBack={onBack} />
      <LibraryTabs tab={tab} onTab={setTab} tabs={TABS} />
      <div style={{ padding: `0 ${S.x4}px` }}>
        {tab === "summaries"
          ? <SummaryList ids={ids} onBack={onBack} onOpenUnit={onOpenUnit} />
          : <MyHighlights onBack={onBack} onOpenUnit={onOpenUnit} />}
      </div>
    </div>
  );
}
