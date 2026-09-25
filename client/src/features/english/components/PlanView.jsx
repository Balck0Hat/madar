import { CalendarDays } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// خطة أسبوعين مبنية على أضعف المواضيع: الأسبوع الأول علاج، والثاني تثبيت بالمهارات الأربع
export default function PlanView({ plan }) {
  const num = useNum();
  if (!plan?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.x2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.md, fontWeight: 700 }}><CalendarDays size={18} color={C.gold} aria-hidden="true" />خطة الأسبوعين القادمين</div>
      {plan.map((w) => (
        <div key={w.week} style={{ display: "grid", gap: S.md }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.md }}>
            <span className="madar-num" style={{ fontSize: T.xs, fontWeight: 700, color: C.gold, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px` }}>الأسبوع {num(w.week)}</span>
            <span style={{ fontSize: T.sm, fontWeight: 700 }}>{w.title}</span>
          </div>
          <ol style={{ margin: 0, paddingInlineStart: S.x5, display: "grid", gap: S.md, fontSize: T.sm, lineHeight: 1.8 }}>
            {w.items.map((it, i) => <li key={i}>{it}</li>)}
          </ol>
        </div>
      ))}
    </div>
  );
}
