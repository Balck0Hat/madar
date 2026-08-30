import { C, MONO, alpha, T, R } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";

const W = 320, ROW = 14, BAR = 9;

// أربع مراحل بترتيب ثابت وتدرّج يزداد وضوحاً كلما ضاق القمع؛
// الترتيب نفسه يميّزها فلا يعتمد الفهم على اللون وحده.
export const STAGES = [
  { key: "opens", label: "فتحوها", color: alpha(C.gold, 0.3) },
  { key: "reached", label: "بلغوا منتصف القراءة", color: alpha(C.gold, 0.6) },
  { key: "quizStarts", label: "بدؤوا الاختبار", color: C.gold },
  { key: "finishes", label: "أنهوها", color: C.green },
];

export const toneOf = (completion) => (completion < 40 ? C.red : completion < 70 ? C.gold : C.green);

export default function FunnelBars({ row }) {
  const num = useNum();
  const max = Math.max(1, row.opens);
  const height = STAGES.length * ROW;
  const tone = toneOf(row.completion);
  const at = row.medianPage ? ` (البطاقة ${num(row.medianPage)})` : "";
  const summary = `فتحها ${num(row.opens)}، بلغ منتصفها${at} ${num(row.reached)}، بدأ الاختبار ${num(row.quizStarts)}، أنهاها ${num(row.finishes)} — أي ${num(row.completion)}٪.`;

  return (
    <div style={{ display: "grid", gap: 6, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: T.base, fontWeight: 700, lineHeight: 1.5 }}>{row.title}</span>
        <span style={{ fontFamily: MONO, fontSize: T.base, fontWeight: 800, color: tone, whiteSpace: "nowrap" }}>{num(row.completion)}٪</span>
      </div>
      {/* الرسم زخرفي: الملخّص النصي تحته يحمل الأرقام كاملة لقارئ الشاشة وللعين معاً */}
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="xMidYMid meet" width="100%" aria-hidden="true" focusable="false" style={{ display: "block" }}>
        {STAGES.map((s, i) => {
          const value = row[s.key] || 0;
          // الأعمدة تنمو من اليمين لأن الواجهة كلها بالاتجاه العربي
          const w = value ? Math.max(Math.round((value / max) * W), BAR) : 0;
          return (
            <g key={s.key}>
              <rect x={0} y={i * ROW} width={W} height={BAR} rx={BAR / 2} fill={alpha(C.muted, 0.14)} />
              {w > 0 && <rect x={W - w} y={i * ROW} width={w} height={BAR} rx={BAR / 2} fill={s.color} />}
            </g>
          );
        })}
      </svg>
      <p style={{ margin: 0, color: C.muted, fontSize: T.sm, lineHeight: 1.8 }}>{summary}</p>
      {row.dropOffPage ? (
        <p style={{ margin: 0, fontSize: T.sm, lineHeight: 1.7, background: alpha(C.red, 0.12), border: `1px solid ${alpha(C.red, 0.3)}`, borderRadius: R.md, padding: "6px 10px" }}>
          يتوقف أكثرهم بعد البطاقة <b style={{ fontFamily: MONO }}>{num(row.dropOffPage)}</b> — {num(row.dropOffShare)}٪ ممن فتحوا الوحدة لم يتجاوزوها.
        </p>
      ) : (
        <p style={{ margin: 0, color: C.muted, fontSize: T.sm }}>لا صفحة توقّف واضحة في هذه الوحدة.</p>
      )}
    </div>
  );
}
