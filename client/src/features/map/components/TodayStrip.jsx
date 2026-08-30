import { ChevronDown, Flame, Zap, RotateCcw } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useTodayOpen } from "../hooks/useTodayOpen";
import TodayPanel from "./TodayPanel";

const fact = { display: "inline-flex", alignItems: "center", gap: S.sm, fontSize: T.sm, color: C.muted, fontFamily: MONO };

// السهم يدور فقط (transform) ولا يتحرّك أصلاً لمن طلب حركة مخفّضة.
// نحقن القاعدة هنا لا في global.js لأنها خاصة بهذا المكوّن وحده.
const CHEV_CSS = `
.madar-chev{transition:transform .2s ease}
@media (prefers-reduced-motion:reduce){.madar-chev{transition:none}}
`;

// كل ما ليس الفعل الأساسي يُطوى هنا: سلسلة، نقاط أسبوع، مراجعة مستحقة، تحدي اليوم.
// مطويّ افتراضياً — الأرقام متاحة لمن يطلبها، لا معروضة على من لم يطلبها.
export default function TodayStrip(props) {
  const { streak = 0, weeklyXp = 0, reviewDue = 0, calm = false } = props;
  const num = useNum();
  const [open, toggle] = useTodayOpen();

  // في وضع الهدوء لا يبقى شيء يُعرض إن لم تكن هناك مراجعة مستحقة، فنحذف الشريط كله
  if (calm && reviewDue === 0) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: `${S.xl}px ${S.x3}px` }}>
      <style>{CHEV_CSS}</style>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="madar-today-panel"
        style={{ width: "100%", background: "transparent", border: "none", padding: 0, cursor: "pointer", color: C.text, display: "flex", alignItems: "center", justifyContent: "space-between", gap: S.xl }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: S.xl, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: T.md }}>اليوم</span>
          {/* ملخّص صامت: أرقام صغيرة بلا ألوان صارخة، لأن الهدف الاطمئنان لا الضغط */}
          {!calm && <span style={fact}><Flame size={12} color={C.muted} aria-hidden="true" />{num(streak)}</span>}
          {!calm && <span style={fact}><Zap size={12} color={C.muted} aria-hidden="true" />{num(weeklyXp)}</span>}
          {reviewDue > 0 && (
            <span style={{ ...fact, color: C.gold, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px` }}>
              <RotateCcw size={12} aria-hidden="true" />{num(reviewDue)}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          color={C.muted}
          aria-hidden="true"
          className="madar-chev"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      <div id="madar-today-panel" hidden={!open}>
        {open && <TodayPanel {...props} />}
      </div>
    </div>
  );
}
