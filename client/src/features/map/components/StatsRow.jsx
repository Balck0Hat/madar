import { Flame, Zap } from "lucide-react";
import { C, FONT, MONO, T, R } from "../../../shared/constants/theme";
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map(([I, l, v, col, font]) => (
        <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: T.xs }}>
            <I size={13} color={col} aria-hidden="true" />{l}
          </div>
          <div style={{ fontWeight: 800, fontSize: T.xl, marginTop: 4, fontFamily: font }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
