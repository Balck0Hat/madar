import { C } from "../../../shared/constants/theme";

// رسوم خطية صغيرة بأسلوب Spot: الجولة تشرح ثلاثة مفاهيم بصرية، فالرسم جزء من الشرح لا زينة
const ART = {
  // العجلة: قطاعات (مجالات) × حلقات (مدارات)
  wheel: (
    <g>
      <circle cx="60" cy="60" r="13" />
      <circle cx="60" cy="60" r="27" />
      <circle cx="60" cy="60" r="40" />
      <circle cx="60" cy="60" r="52" strokeDasharray="4 6" />
      <path d="M60 8v104M8 60h104M23 23l74 74M97 23l-74 74" strokeOpacity=".45" />
    </g>
  ),
  // الخيط: نقطتان في قطاعين مختلفين يربطهما قوس
  thread: (
    <g>
      <circle cx="60" cy="60" r="46" strokeOpacity=".35" />
      <circle cx="28" cy="44" r="7" />
      <circle cx="92" cy="76" r="7" />
      <path d="M33 49C52 40 62 84 87 72" strokeDasharray="5 4" />
      <path d="M60 14v12M60 94v12" strokeOpacity=".3" />
    </g>
  ),
  // المدارات: ثلاث حلقات، الداخلية مضيئة والخارجيتان منقّطتان (مقفلتان)
  rings: (
    <g>
      <circle cx="60" cy="60" r="16" />
      <circle cx="60" cy="60" r="32" strokeDasharray="3 5" />
      <circle cx="60" cy="60" r="48" strokeDasharray="2 7" />
      <path d="M60 44v-14M56 34l4-5 4 5" />
    </g>
  ),
};

// aria-hidden: النص المجاور يحمل المعنى كاملاً
export default function TourArt({ k, size = 120, color = C.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ART[k]}
    </svg>
  );
}
