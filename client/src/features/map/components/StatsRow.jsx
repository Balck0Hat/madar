import { Flame, Zap, Star } from "lucide-react";
import { C, FONT, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";

export default function StatsRow({ streak, weeklyXp, rank }) {
  const num = useNum();
  const items = [
    [Flame, "السلسلة", `${num(streak)} يوم`, C.red, FONT],
    [Zap, "نقاط الأسبوع", num(weeklyXp), C.gold, MONO],
    [Star, "الرتبة", rank, C.text, FONT],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px" }}>
      {items.map(([I, l, v, col, font]) => (
        <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 11 }}><I size={13} color={col} />{l}</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4, fontFamily: font }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
