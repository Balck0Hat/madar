import { C, FONT } from "../../../shared/constants/theme";
import { stats } from "../../../shared/utils/progress";
import { useNum } from "../../../shared/context/NumContext";
import WheelBody from "../../../shared/components/wheel/WheelBody";
import { SKY } from "../../../shared/components/wheel/geometry";

// بطاقة طولية (9:16) للمشاركة في الستوري
export default function ShareCard({ profile, progress, level, refEl }) {
  const st = stats(progress);
  const num = useNum();
  return (
    <svg ref={refEl} viewBox="0 0 360 640" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", borderRadius: 18 }}>
      <rect width="360" height="640" fill={C.bg} />
      {SKY.slice(0, 40).map((s, i) => <circle key={i} cx={s.x * 0.87 + 20} cy={s.y * 1.55} r={s.r} fill={C.text} opacity={s.o} />)}
      <text x="180" y="70" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="30" fontWeight="900">مدار</text>
      <text x="180" y="96" textAnchor="middle" fill={C.gold} fontFamily={FONT} fontSize="12" fontWeight="700">عجلة {profile.name}</text>
      <svg x="30" y="120" width="300" height="300" viewBox="-26 -26 412 412"><WheelBody progress={progress} level={level} compact sky={false} /></svg>
      <text x="180" y="470" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="22" fontWeight="800">{st.rank} · المستوى {num(level)}</text>
      <text x="180" y="498" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="12">{num(st.units)} وحدة · {num(st.threads)} خيط · {num(st.sectors)} قطاع مكتمل</text>
      <rect x="110" y="540" width="140" height="34" rx="17" fill="none" stroke={C.gold} strokeWidth="1" />
      <text x="180" y="562" textAnchor="middle" fill={C.gold} fontFamily={FONT} fontSize="11" fontWeight="700">افهم كل شيء. خطوة خطوة.</text>
    </svg>
  );
}
