import { C, MONO, T, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Card } from "../../../shared/components/ui";

// شبكة أيام الشهر الحالي مع تمييز أيام الدراسة
export default function StudyCalendar({ studied }) {
  const num = useNum();
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthName = now.toLocaleDateString("ar", { month: "long" });
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: S.xl }}>
        <div style={{ fontWeight: 700 }}>{monthName}</div>
        <div style={{ color: C.muted, fontSize: T.sm }}>{num(studied.length)} يوم دراسة</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: S.sm }}>
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1, key = `${now.getFullYear()}-${now.getMonth()}-${day}`;
          const on = studied.includes(key), today = day === now.getDate();
          return (
            <div key={i} title={String(day)} style={{ aspectRatio: "1", borderRadius: R.sm, background: on ? C.gold : C.surface2, border: `1px solid ${today ? C.gold : C.line}`, display: "grid", placeItems: "center", fontSize: T.xs, fontFamily: MONO, color: on ? "var(--bg)" : C.muted }}>
              {num(day)}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
