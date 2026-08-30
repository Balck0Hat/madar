import { HEX_DARK as C, FONT, MONO, R } from "../../../shared/constants/theme";
import { stats } from "../../../shared/utils/progress";
import { useNum } from "../../../shared/context/NumContext";
import WheelBody from "../../../shared/components/wheel/WheelBody";
import { SKY } from "../../../shared/components/wheel/geometry";
import { GoldDefs, star8, Rule, Lozenge } from "./CardArt";

// نجوم الخلفية موزّعة على البطاقة كلها (SKY محصورة في أطراف مربع 412)
const sx = (s) => +(((s.x + 26) / 412) * 360).toFixed(1);
const sy = (s) => +(((s.y + 26) / 412) * 640).toFixed(1);

const Stat = ({ x, value, label }) => (
  <g textAnchor="middle">
    <text x={x} y={553} fill={C.gold} fontFamily={MONO} fontSize="19" fontWeight="700">{value}</text>
    <text x={x} y={568} fill={C.muted} fontFamily={FONT} fontSize="9.5">{label}</text>
  </g>
);

// بطاقة طولية (9:16) للمشاركة في الستوري — ألوان حرفية لتُصدَّر كصورة PNG
export default function ShareCard({ profile, progress, level, refEl }) {
  const st = stats(progress);
  const num = useNum();
  return (
    <svg ref={refEl} viewBox="0 0 360 640" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", borderRadius: R.x3 }} direction="rtl">
      <defs>
        <GoldDefs />
        <linearGradient id="cg-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060A16" /><stop offset=".32" stopColor="#121B3C" /><stop offset=".62" stopColor="#0D1430" /><stop offset="1" stopColor="#060A16" />
        </linearGradient>
        <radialGradient id="cg-halo" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={C.gold} stopOpacity=".3" /><stop offset=".45" stopColor={C.gold} stopOpacity=".1" /><stop offset="1" stopColor={C.gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* سماء الليل والنجوم */}
      <rect width="360" height="640" fill={C.bg} />
      <rect width="360" height="640" fill="url(#cg-night)" />
      {SKY.map((s, i) => <circle key={i} cx={sx(s)} cy={sy(s)} r={(s.r * 0.95).toFixed(2)} fill={C.text} opacity={s.o.toFixed(2)} />)}
      {SKY.map((s, i) => <circle key={`g${i}`} cx={360 - sx(s)} cy={640 - sy(s)} r={(s.r * 0.6).toFixed(2)} fill={C.gold} opacity={(s.o * 0.55).toFixed(2)} />)}

      {/* إطار رفيع بنجيمات في الأركان */}
      <rect x="10" y="10" width="340" height="620" rx="17" fill="none" stroke={C.gold} strokeWidth="0.8" strokeOpacity=".22" />
      {[[24, 24], [336, 24], [24, 616], [336, 616]].map(([cx, cy]) => <path key={`${cx}-${cy}`} d={star8(cx, cy, 3.6)} fill={C.gold} fillOpacity=".4" />)}

      {/* الترويسة */}
      <Rule x={62} y={62} w={58} h={0.7} /><Rule x={240} y={62} w={58} h={0.7} />
      <text x="180" y="74" textAnchor="middle" fill="url(#cg-gold)" fontFamily={FONT} fontSize="34" fontWeight="900">مدار</text>
      <text x="180" y="99" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="13" fontWeight="700">عجلة {profile.name}</text>

      {/* العجلة: البطل، فوق هالة ذهبية ناعمة */}
      <circle cx="180" cy="296" r="182" fill="url(#cg-halo)" />
      <svg x="18" y="134" width="324" height="324" viewBox="-26 -26 412 412"><WheelBody progress={progress} level={level} compact sky={false} palette={C} /></svg>

      {/* الرتبة والمستوى */}
      <Rule x={112} y={476} w={56} h={0.7} /><Lozenge cx={180} cy={476.4} r={2.6} /><Rule x={192} y={476} w={56} h={0.7} />
      <text x="180" y="503" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="24" fontWeight="900">{st.rank}</text>
      <text x="180" y="523" textAnchor="middle" fill={C.gold} fontFamily={FONT} fontSize="12" fontWeight="700">المستوى {num(level)}</text>

      {/* الإحصاءات */}
      <Stat x={90} value={num(st.units)} label="وحدة" />
      <Stat x={180} value={num(st.threads)} label="خيط" />
      <Stat x={270} value={num(st.sectors)} label="قطاع" />
      <rect x="135" y="539" width="0.7" height="34" fill={C.gold} fillOpacity=".22" />
      <rect x="225" y="539" width="0.7" height="34" fill={C.gold} fillOpacity=".22" />

      {/* الشعار والمُعرّف العام */}
      <rect x="76" y="582" width="208" height="32" rx="16" fill={C.surface} fillOpacity=".55" stroke="url(#cg-gold)" strokeWidth="0.9" />
      <text x="180" y="602" textAnchor="middle" fill={C.gold} fontFamily={FONT} fontSize="12" fontWeight="700">افهم كل شيء. خطوة خطوة.</text>
      <text x="180" y="626" textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize="8.5" direction="ltr">مدار /u/{profile.handle || ""}</text>
    </svg>
  );
}
