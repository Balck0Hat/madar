import { C, MONO, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";

const W = 340, H = 152, PAD = 10, TOP = 30, BASE = 118, LABEL_Y = 138;

// اسم الأسبوع قد يكون "2026-W12" أو تاريخاً؛ نختصره إلى رقم/يوم قابل للقراءة
const weekLabel = (week) => {
  const iso = /W(\d+)/i.exec(week);
  if (iso) return iso[1];
  const d = new Date(week);
  if (!Number.isNaN(d.getTime())) return `${d.getDate()}/${d.getMonth() + 1}`;
  return String(week).slice(-5);
};

// رسم بياني بالأعمدة لآخر ٨ أسابيع، SVG مباشر بلا مكتبة رسوم.
// viewBox + preserveAspectRatio يجعلانه يتمدد مع عرض الحاوية على كل الشاشات.
export default function WeeklyXpChart({ weeks }) {
  const num = useNum();
  const data = weeks.slice(-8);
  if (!data.length) return null;

  const max = Math.max(1, ...data.map((w) => w.xp));
  const peak = data.reduce((best, w, i) => (w.xp > data[best].xp ? i : best), 0);
  const slot = (W - PAD * 2) / data.length;
  const bw = Math.min(30, slot * 0.56);
  const total = data.reduce((s, w) => s + w.xp, 0);
  const summary = `نقاط آخر ${data.length} أسابيع: المجموع ${total} نقطة، أعلى أسبوع ${data[peak].xp} نقطة، وأحدث أسبوع ${data[data.length - 1].xp} نقطة.`;

  return (
    <section style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>نقاطك الأسبوعية</h2>
      <p style={{ margin: "2px 0 6px", color: C.muted, fontSize: 12 }}>آخر {num(data.length)} أسابيع — المجموع {num(total)} نقطة</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" width="100%" role="img" aria-label={summary} style={{ display: "block" }}>
        {data.map((w, i) => {
          const h = Math.round((w.xp / max) * (BASE - TOP));
          const x = PAD + i * slot + (slot - bw) / 2;
          return (
            <g key={`${w.week}-${i}`}>
              {/* عمود باهت يوضّح سقف المقياس حتى لا تبدو الأسابيع الصفرية فارغة تماماً */}
              <rect x={x} y={TOP} width={bw} height={BASE - TOP} rx="5" fill={alpha(C.muted, 0.1)} />
              <rect x={x} y={BASE - h} width={bw} height={Math.max(h, 2)} rx="5" fill={C.gold} />
              {i === peak && w.xp > 0 && (
                <text x={x + bw / 2} y={BASE - h - 8} textAnchor="middle" fontFamily={MONO} fontSize="12" fontWeight="700" fill={C.gold}>{num(w.xp)}</text>
              )}
              <text x={x + bw / 2} y={LABEL_Y} textAnchor="middle" fontFamily={MONO} fontSize="10" fill={C.muted}>{num(weekLabel(w.week))}</text>
            </g>
          );
        })}
        <line x1={PAD} y1={BASE + 0.5} x2={W - PAD} y2={BASE + 0.5} stroke={C.line} strokeWidth="1" />
      </svg>
    </section>
  );
}
