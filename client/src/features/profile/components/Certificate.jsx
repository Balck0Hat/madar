import { HEX_DARK as C, FONT, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { GoldDefs, GeoPattern, Seal, Corner, Rule, Lozenge } from "./CardArt";

// شهادة إتمام (SVG قابل للتصدير كصورة PNG — ألوان حرفية فقط، لا متغيرات CSS).
// النص يقول بالضبط ما تشهد به: إتمام وحدات المدار الأول واجتياز امتحان غير مراقَب.
// «شهادة إتمام» لا «شهادة خبرة»: الادعاء الأكبر من ذلك يجعل الورقة كاذبة.
export default function Certificate({ name, earned, code, date, refEl }) {
  const num = useNum();
  return (
    <svg ref={refEl} viewBox="0 0 360 250" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", borderRadius: 14 }} direction="rtl">
      <defs>
        <GoldDefs />
        <GeoPattern />
        <radialGradient id="cg-paper" cx=".5" cy=".4" r=".82">
          <stop offset="0" stopColor="#19244D" /><stop offset=".55" stopColor="#101833" /><stop offset="1" stopColor="#070B18" />
        </radialGradient>
      </defs>

      {/* الأرضية والإطار */}
      <rect width="360" height="250" fill={C.bg} />
      <rect width="360" height="250" fill="url(#cg-paper)" />
      <rect x="8" y="8" width="344" height="234" rx="7" fill="none" stroke="url(#cg-gold)" strokeWidth="1" strokeOpacity=".8" />
      <path d="M12,12h336v226H12z M30,30h300v190H30z" fill="url(#cg-geo)" fillRule="evenodd" />
      <rect x="30" y="30" width="300" height="190" fill="none" stroke="url(#cg-gold)" strokeWidth="1.3" />
      <rect x="33.5" y="33.5" width="293" height="183" fill="none" stroke={C.gold} strokeWidth="0.4" strokeOpacity=".4" />
      <Corner x={30} y={30} /><Corner x={330} y={30} sx={-1} /><Corner x={30} y={220} sy={-1} /><Corner x={330} y={220} sx={-1} sy={-1} />

      {/* سطر المنصة بين خطين شعريين */}
      <Rule x={104} y={49} w={44} h={0.7} /><Rule x={212} y={49} w={44} h={0.7} />
      <text x="180" y="53" textAnchor="middle" fill="url(#cg-gold)" fontFamily={FONT} fontSize="9.5" fontWeight="700">منصة مدار</text>

      {/* العنوان ثم صيغة الإشهاد */}
      <text x="180" y="76" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="19" fontWeight="800">شهادة إتمام</text>
      <text x="180" y="87" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="8">المدار الأول</text>
      <Rule x={126} y={94} w={44} h={0.7} /><Lozenge cx={180} cy={94.4} r={2.6} /><Rule x={190} y={94} w={44} h={0.7} />
      <text x="180" y="109" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="9.5">تشهد منصة مدار بأن</text>

      {/* الاسم: أكبر سطر، ذهب معدني بظل خفيف يمنحه بروزاً */}
      <text x="180" y="135.2" textAnchor="middle" fill="#05070F" fillOpacity=".55" fontFamily={FONT} fontSize="26" fontWeight="900">{name}</text>
      <text x="180" y="134" textAnchor="middle" fill="url(#cg-gold)" fontFamily={FONT} fontSize="26" fontWeight="900">{name}</text>
      <Rule x={92} y={143.5} w={176} /><Lozenge cx={180} cy={143.9} r={2.4} />

      {/* ما تشهد به الورقة، بلا مبالغة: وحدات مكتملة وامتحان غير مراقَب */}
      <text x="180" y="156" textAnchor="middle" fill={C.text} fillOpacity=".92" fontFamily={FONT} fontSize="9">أتمّ وحدات المدار الأول الثلاث والثمانين في عشرة مجالات</text>
      <text x="180" y="167" textAnchor="middle" fill={C.text} fillOpacity=".82" fontFamily={FONT} fontSize="8.2">واجتاز امتحان إتمام من أربعين سؤالاً بنسبة ثمانين بالمئة فأعلى</text>
      <text x="180" y="177.5" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="7">امتحان غير مراقَب · شهادة إتمام لا شهادة خبرة أو تأهيل مهني</text>

      {/* الختم، ورمز التحقق يساراً والتاريخ يميناً */}
      <Seal cx={180} cy={199} r={15.5} />
      <text x="72" y="190" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="7">رمز التحقق</text>
      <text x="72" y="203" textAnchor="middle" fill={C.text} fontFamily={MONO} fontSize="8.5" fontWeight="700" direction="ltr">{code}</text>
      <Rule x={38} y={208} w={68} h={0.6} />
      <text x="288" y="190" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="7">تاريخ الإصدار</text>
      <text x="288" y="203" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="8.5" fontWeight="700">{num(date)}</text>
      <Rule x={254} y={208} w={68} h={0.6} />

      {!earned && <text x="180" y="130" textAnchor="middle" fill={C.text} fillOpacity="0.16" fontFamily={FONT} fontSize="56" fontWeight="900" transform="rotate(-14 180 130)">معاينة</text>}
    </svg>
  );
}
