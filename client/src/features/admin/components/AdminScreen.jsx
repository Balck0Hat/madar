import { useState } from "react";
import { C } from "../../../shared/constants/theme";
import { TopBar } from "../../../shared/components/ui";
import StatsPanel from "./StatsPanel";
import UnitList from "./UnitList";
import UnitEditor from "./UnitEditor";

const TABS = [["stats", "الإحصاءات"], ["units", "الوحدات"]];

// لوحة المشرف: إحصاءات + محرّر المحتوى
export default function AdminScreen({ onBack, onToast, onContentChanged }) {
  const [tab, setTab] = useState("units");
  const [editing, setEditing] = useState(null);
  if (editing) return <UnitEditor unitId={editing.unitId} isNew={editing.isNew} onBack={() => setEditing(null)} onSaved={() => { onContentChanged(); setEditing((e) => ({ ...e, isNew: false })); }} onToast={onToast} />;
  return (
    <div className="madar-in" style={{ paddingBottom: 40 }}>
      <TopBar title="لوحة المشرف" onBack={onBack} />
      <div style={{ padding: "0 16px" }}>
        <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {TABS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ flex: 1, background: tab === k ? C.goldSoft : C.surface, border: `1px solid ${tab === k ? C.gold : C.line}`, color: tab === k ? C.gold : C.text, borderRadius: 12, padding: "9px 6px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>)}
        </div>
        {tab === "stats" && <StatsPanel />}
        {tab === "units" && <UnitList onEdit={(unitId) => setEditing({ unitId, isNew: false })} onCreate={(unitId) => setEditing({ unitId, isNew: true })} />}
      </div>
    </div>
  );
}
