import { C, FONT, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";

// شهادة الثقافة العامة (SVG قابل للتصدير كصورة)
export default function Certificate({ name, earned, code, date, refEl }) {
  const num = useNum();
  return (
    <svg ref={refEl} viewBox="0 0 360 250" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", borderRadius: 14 }} direction="rtl">
      <defs>
        <pattern id="geo" width="18" height="18" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={C.gold} strokeWidth="0.9" opacity="0.85">
            <rect x="4" y="4" width="10" height="10" transform="rotate(45 9 9)" /><rect x="4" y="4" width="10" height="10" /><circle cx="9" cy="9" r="1.2" fill={C.gold} stroke="none" />
          </g>
        </pattern>
        <linearGradient id="gold" x1="0" x2="1"><stop offset="0" stopColor="#F2B544" /><stop offset=".5" stopColor="#FFE39A" /><stop offset="1" stopColor="#D9982A" /></linearGradient>
      </defs>
      <rect width="360" height="250" fill={C.bg} />
      <path d="M8 8h344v234H8z M26 26h308v198H26z" fill="url(#geo)" fillRule="evenodd" />
      <rect x="26" y="26" width="308" height="198" fill="none" stroke="url(#gold)" strokeWidth="1.5" />
      <text x="180" y="62" textAnchor="middle" fill="url(#gold)" fontFamily={FONT} fontSize="9">منصة مدار</text>
      <text x="180" y="88" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="19" fontWeight="800">شهادة الثقافة العامة</text>
      <text x="180" y="110" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="9.5">تشهد منصة مدار بأن</text>
      <text x="180" y="140" textAnchor="middle" fill="url(#gold)" fontFamily={FONT} fontSize="24" fontWeight="900">{name}</text>
      <text x="180" y="162" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="9.5">أكمل المدار الأول: عشرة مجالات، ثلاث وثمانون وحدة، واجتاز امتحان المدار</text>
      <text x="70" y="206" textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize="8">{code}</text>
      <text x="290" y="206" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="8">{num(date)}</text>
      <circle cx="180" cy="200" r="13" fill="none" stroke="url(#gold)" strokeWidth="1.2" /><circle cx="180" cy="200" r="8" fill="none" stroke="url(#gold)" strokeWidth="0.8" /><circle cx="180" cy="200" r="2.5" fill="url(#gold)" />
      {!earned && <text x="180" y="132" textAnchor="middle" fill={C.text} fillOpacity="0.14" fontFamily={FONT} fontSize="54" fontWeight="900" transform="rotate(-14 180 132)">معاينة</text>}
    </svg>
  );
}
