import { uid } from "../../utils/units";
import { sectorPath } from "./geometry";

// قطاع مجال في مدار. النقر لم يعد هنا بل في طبقة اللمس فوقه (WheelHits)،
// فهدف ٢٠×٣٢ بكسل لا يُلمس؛ ويبقى الرسم كما هو تماماً حين تكون العجلة للعرض فقط.
export default function Sector({ d, di, r, progress, locked, recommended, highlight, hot, smooth, p }) {
  const doneN = d.rings[r].filter((_, i) => progress[uid(d.id, r, i)]).length;
  const frac = doneN / 8;
  const isRec = recommended && recommended.startsWith(d.id + "-") && r === 0;
  const isHi = highlight && highlight.di === di && highlight.r === r;
  const ghost = !locked && frac === 0;
  const path = sectorPath(di, r);
  const base = locked ? 0.07 : 0.12 + 0.78 * frac;
  return (
    <g>
      {/* التحويم/التركيز يرفع العتامة قليلاً فقط: إشارة كافية بلا تغيير هوية اللون */}
      <path
        d={path}
        fill={d.color}
        fillOpacity={hot ? Math.min(1, base + 0.14) : base}
        stroke={p.bg}
        strokeWidth="1.5"
        style={smooth ? { transition: "fill-opacity .18s ease" } : undefined}
      />
      {(frac === 1 || isHi) && <path d={path} fill="none" stroke={isHi ? p.gold : d.color} strokeWidth="1.4" filter="url(#glow)" />}
      {ghost && <path d={path} fill="none" stroke={d.color} strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="2 4" />}
      {isRec && <path className="madar-pulse" d={path} fill="none" stroke={p.gold} strokeWidth="2" />}
    </g>
  );
}
