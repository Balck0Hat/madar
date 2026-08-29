import { C, MONO } from "../../../shared/constants/theme";

// حلقة النتيجة عند عدم الاجتياز؛ القوس يتبع الرقم وهو يُعدّ
export default function ScoreRing({ pct, label }) {
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 110 110" width="130" height="130" style={{ margin: "0 auto", display: "block" }}>
      <circle cx="55" cy="55" r={r} fill="none" stroke={C.line} strokeWidth="8" />
      <circle
        cx="55" cy="55" r={r} fill="none" stroke={C.red} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ}`} transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dasharray .3s linear" }}
      />
      <text x="55" y="62" textAnchor="middle" fill={C.text} fontFamily={MONO} fontSize="24" fontWeight="800">{label}</text>
    </svg>
  );
}
