import { TrendingUp, TrendingDown, Clock, Target } from "lucide-react";
import { C, MONO, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { DOMAINS } from "../../../shared/data/domains";

const domainName = (id) => DOMAINS.find((d) => d.id === id)?.name || "—";
const domainColor = (id) => DOMAINS.find((d) => d.id === id)?.color || C.gold;

// الدقة قد تعود كنسبة (0–1) أو كمئوية (0–100)؛ نقبل الشكلين
const toPercent = (v) => (v === null ? null : Math.round(v <= 1 ? v * 100 : v));

const Tile = ({ icon, label, value, color, hint }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 12, display: "grid", gap: 4 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 12 }}>
      <span style={{ width: 22, height: 22, borderRadius: 8, background: alpha(color, 0.15), display: "grid", placeItems: "center" }} aria-hidden="true">{icon}</span>
      {label}
    </div>
    <div style={{ fontWeight: 800, fontSize: 17, color, fontFamily: hint ? MONO : undefined }}>{value}</div>
    {hint && <div style={{ color: C.muted, fontSize: 11 }}>{hint}</div>}
  </div>
);

// بطاقات موجزة: الأقوى، الأضعف، دقائق الدراسة، دقة الاختبارات
export default function StatTiles({ strongest, weakest, totalMinutes, quizAccuracy }) {
  const num = useNum();
  const pct = toPercent(quizAccuracy);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
      <Tile icon={<TrendingUp size={13} color={domainColor(strongest)} />} label="أقوى مجال" value={domainName(strongest)} color={strongest ? domainColor(strongest) : C.muted} />
      <Tile icon={<TrendingDown size={13} color={C.red} />} label="يحتاج تركيزاً" value={domainName(weakest)} color={weakest ? domainColor(weakest) : C.muted} />
      <Tile icon={<Clock size={13} color={C.gold} />} label="دقائق الدراسة" value={hours ? `${num(hours)}س ${num(mins)}د` : `${num(totalMinutes)}د`} color={C.text} hint="مجموع وقت الوحدات" />
      <Tile icon={<Target size={13} color={C.green} />} label="دقة الاختبارات" value={pct === null ? "—" : `${num(pct)}٪`} color={pct === null ? C.muted : C.green} hint={pct === null ? "لا اختبارات بعد" : "من كل الأسئلة"} />
    </div>
  );
}
