import { Flame, Zap } from "lucide-react";
import { C, FONT, MONO, T, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";

// السلسلة ونقاط الأسبوع فقط.
// الرتبة خرجت من هنا: المستوى معروض أصلاً في قلب العجلة، والرتبة مكانها صفحة «أنا»
// حيث يُقرأ التقدّم على مهل، لا على شاشة يُفترض أن تحمل فعلاً واحداً.
export default function StatsRow({ streak, weeklyXp }) {
  const num = useNum();
  const items = [
    [Flame, "السلسلة", `${num(streak)} يوم`, C.red, FONT],
    [Zap, "نقاط الأسبوع", num(weeklyXp), C.gold, MONO],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.lg }}>
      {items.map(([I, l, v, col, font]) => (
        <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: `${S.xl}px ${S.x2}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.md, color: C.muted, fontSize: T.xs }}>
            <I size={13} color={col} aria-hidden="true" />{l}
          </div>
          <div style={{ fontWeight: 700, fontSize: T.xl, marginTop: S.sm, fontFamily: font }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
