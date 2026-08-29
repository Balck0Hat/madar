import { FONT } from "../../constants/theme";
import { sectorPath } from "./geometry";

// حلقة التركيز: نرسمها داخل SVG بدل outline الأصلي لأن المتصفح يرسم الـoutline
// مستطيلاً حول الصندوق المحيط — وهو تشويه لقطاع حلقي. نبقى على العرف نفسه:
// ٢px بلون var(--gold).
export function FocusRing({ cue, units, p }) {
  if (!cue) return null;
  if (cue.kind === "unit") {
    const u = units.find((x) => x.id === cue.id);
    return u ? <circle cx={u.x} cy={u.y} r="6.5" fill="none" stroke={p.gold} strokeWidth="2" pointerEvents="none" /> : null;
  }
  return <path d={sectorPath(cue.di, cue.r, 0.4, 2.5)} fill="none" stroke={p.gold} strokeWidth="2" pointerEvents="none" />;
}

// شارة أسفل العجلة تسمّي ما تحت المؤشّر أو التركيز.
// موضع ثابت لأن ٢٤٠ نقطة متجاورة تجعل أي شارة ملاصقة للنقطة تتصادم وتُقصّ.
export function Cue({ text, p }) {
  if (!text) return null;
  const t = text.length > 44 ? `${text.slice(0, 43)}…` : text;
  const w = Math.max(72, t.length * 6.6 + 24);
  return (
    <g pointerEvents="none" aria-hidden="true">
      <rect x={180 - w / 2} y="360" width={w} height="23" rx="11.5" fill={p.surface} stroke={p.gold} strokeOpacity="0.4" />
      <text x="180" y="375.5" textAnchor="middle" fill={p.text} fontFamily={FONT} fontSize="11.5" direction="rtl">{t}</text>
    </g>
  );
}
