import { Lock } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { DOMAINS } from "../../../shared/data/domains";
import { RING_NAMES, RING_MIN, XP_LESSON, XP_QUIZ } from "../../../shared/data/curriculum";
import { uid } from "../../../shared/utils/units";
import { stats, domainDone } from "../../../shared/utils/progress";
import { useNum } from "../../../shared/context/NumContext";
import { Bar, TopBar } from "../../../shared/components/ui";
import { Icon, PatternBand } from "../../../shared/components/icons/Icon";
import UnitRow from "./UnitRow";

export default function DomainScreen({ domainId, ringIdx, progress, authored = [], onBack, onOpenUnit, onRing }) {
  const num = useNum();
  const d = DOMAINS.find((x) => x.id === domainId);
  const st = stats(progress);
  const locked = ringIdx > 0 && !st.ring1Done;
  const n = domainDone(progress, d.id, ringIdx);
  return (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={d.name} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px` }}>
        <PatternBand id={d.id} color={d.color}>
          <div style={{ display: "flex", alignItems: "center", gap: S.x3 }}>
            <div style={{ width: 52, height: 52, borderRadius: R.x2, background: C.bg, border: `1px solid ${alpha(d.color, 0.4)}`, display: "grid", placeItems: "center" }}><Icon id={d.id} size={28} color={d.color} /></div>
            <div><div style={{ fontWeight: 700, fontSize: T.x3 }}>{d.name}</div><div style={{ color: C.muted, fontSize: T.base }}>{d.desc}</div></div>
          </div>
        </PatternBand>
        <div role="tablist" style={{ display: "flex", gap: S.md, margin: `${S.x3}px 0 ${S.xl}px` }}>
          {RING_NAMES.map((r, i) => (
            <button key={r} type="button" role="tab" aria-selected={ringIdx === i} onClick={() => onRing(i)} style={{ flex: 1, background: ringIdx === i ? alpha(d.color, 0.15) : C.surface, border: `1px solid ${ringIdx === i ? d.color : C.line}`, color: C.text, borderRadius: R.lg, padding: `${S.lg}px ${S.md}px`, fontSize: T.sm, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: S.sm }}>
              {i > 0 && !st.ring1Done && <Lock size={11} />}{r}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.md, fontSize: T.base }}>
          <span style={{ color: C.muted }}>{num(RING_MIN[ringIdx])} دقيقة للوحدة · {num(XP_LESSON[ringIdx] + XP_QUIZ[ringIdx])} XP</span>
          <span style={{ fontFamily: MONO, color: C.muted }}>{num(n)}/{num(8)}</span>
        </div>
        <Bar value={n / 8} color={d.color} />
        {locked && (
          <div style={{ background: C.goldSoft, border: `1px solid ${alpha(C.gold, 0.33)}`, borderRadius: R.xl, padding: `${S.xl}px ${S.x2}px`, marginTop: S.x2, fontSize: T.base, display: "flex", gap: S.lg, alignItems: "center" }}>
            <Lock size={14} color={C.gold} /> يُفتح هذا المدار بعد إكمال المدار الأول في المجالات العشرة كلها.
          </div>
        )}
        <div style={{ display: "grid", gap: S.lg, marginTop: S.x3 }}>
          {d.rings[ringIdx].map((title, i) => {
            const id = uid(d.id, ringIdx, i);
            return <UnitRow key={id} index={i} title={title} color={d.color} done={progress[id]} authored={authored.includes(id)} locked={locked} onOpen={() => onOpenUnit(id)} />;
          })}
        </div>
      </div>
    </div>
  );
}
