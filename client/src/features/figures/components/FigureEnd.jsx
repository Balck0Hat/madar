import { BookOpen } from "lucide-react";
import { P, R, S, TAP } from "../../../shared/constants/theme";
import CheckIn from "../../../shared/components/ui/CheckIn";
import FigureRelated from "./FigureRelated";

// ما بعد آخر قسم: سؤال سريع اختياري (مطويّ، لا نقاط ولا شرط)، ثم الدروس التي
// تذكر الشخصية (تُحسب عند الزرع من نصوص الوحدات)، ثم المصادر، ثم المرتبطون
// والتالي. الملف لا ينتهي فجأة بعد المصادر.
export default function FigureEnd({ figure, list, color, onOpen, onOpenUnit }) {
  const check = figure.check ? { t: "mcq", q: figure.check.q, opts: figure.check.opts, a: figure.check.a, why: figure.check.why } : null;
  const units = onOpenUnit ? figure.units || [] : [];
  return (
    <div style={{ display: "grid", gap: S.x5, marginTop: S.x4 }}>
      <CheckIn question={check} color={color} />
      {units.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: ".9em", marginBottom: S.lg }}>في الدروس</div>
          <div style={{ display: "grid", gap: S.md }}>
            {units.map((u) => (
              <button key={u.unitId} type="button" onClick={() => onOpenUnit(u.unitId)} className="madar-press"
                style={{ display: "flex", alignItems: "center", gap: S.x2, minHeight: TAP, textAlign: "start", fontFamily: "inherit", fontSize: ".92em", cursor: "pointer", color: P.ink, background: P.card, border: `1px solid ${P.line}`, borderRadius: R.xl, padding: `${S.xl}px ${S.x3}px` }}>
                <BookOpen size={16} color={color} aria-hidden="true" /><span style={{ minWidth: 0, flex: 1 }}>{u.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {figure.sources?.length > 0 && (
        <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: S.x2, color: P.muted, fontSize: ".8em", lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, marginBottom: S.sm }}>للاستزادة</div>
          {figure.sources.map((s, i) => <div key={i}>· {s}</div>)}
        </div>
      )}
      <FigureRelated figure={figure} list={list} onOpen={onOpen} />
    </div>
  );
}
