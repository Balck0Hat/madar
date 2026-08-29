import { Lock } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { DOMAINS } from "../../../shared/data/domains";
import { RING_NAMES, RING_MIN, XP_LESSON, XP_QUIZ } from "../../../shared/data/curriculum";
import { hasContent } from "../../../shared/data/content";
import { uid } from "../../../shared/utils/units";
import { stats, domainDone } from "../../../shared/utils/progress";
import { useNum } from "../../../shared/context/NumContext";
import { Bar, TopBar } from "../../../shared/components/ui";
import { Icon, PatternBand } from "../../../shared/components/icons/Icon";
import UnitRow from "./UnitRow";

export default function DomainScreen({ domainId, ringIdx, progress, onBack, onOpenUnit, onRing }) {
  const num = useNum();
  const d = DOMAINS.find((x) => x.id === domainId);
  const st = stats(progress);
  const locked = ringIdx > 0 && !st.ring1Done;
  const n = domainDone(progress, d.id, ringIdx);
  return (
    <div className="madar-in" style={{ paddingBottom: 40 }}>
      <TopBar title={d.name} onBack={onBack} />
      <div style={{ padding: "0 16px" }}>
        <PatternBand id={d.id} color={d.color}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.bg, border: `1px solid ${d.color}66`, display: "grid", placeItems: "center" }}><Icon id={d.id} size={28} color={d.color} /></div>
            <div><div style={{ fontWeight: 900, fontSize: 20 }}>{d.name}</div><div style={{ color: C.muted, fontSize: 13 }}>{d.desc}</div></div>
          </div>
        </PatternBand>
        <div role="tablist" style={{ display: "flex", gap: 6, margin: "14px 0 10px" }}>
          {RING_NAMES.map((r, i) => (
            <button key={r} type="button" role="tab" aria-selected={ringIdx === i} onClick={() => onRing(i)} style={{ flex: 1, background: ringIdx === i ? d.color + "26" : C.surface, border: `1px solid ${ringIdx === i ? d.color : C.line}`, color: C.text, borderRadius: 12, padding: "9px 6px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {i > 0 && !st.ring1Done && <Lock size={11} />}{r}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 13 }}>
          <span style={{ color: C.muted }}>{num(RING_MIN[ringIdx])} دقيقة للوحدة · {num(XP_LESSON[ringIdx] + XP_QUIZ[ringIdx])} XP</span>
          <span style={{ fontFamily: MONO, color: C.muted }}>{num(n)}/{num(8)}</span>
        </div>
        <Bar value={n / 8} color={d.color} />
        {locked && (
          <div style={{ background: C.goldSoft, border: `1px solid ${C.gold}55`, borderRadius: 14, padding: "10px 12px", marginTop: 12, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
            <Lock size={14} color={C.gold} /> يُفتح هذا المدار بعد إكمال المدار الأول في المجالات العشرة كلها.
          </div>
        )}
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {d.rings[ringIdx].map((title, i) => {
            const id = uid(d.id, ringIdx, i);
            return <UnitRow key={id} index={i} title={title} color={d.color} done={progress[id]} authored={hasContent(id)} locked={locked} onOpen={() => onOpenUnit(id)} />;
          })}
        </div>
      </div>
    </div>
  );
}
