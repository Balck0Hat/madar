import { C } from "../../constants/theme";

// رسوم خطية صغيرة لحالات الفراغ، بنفس أسلوب artPaths لكن بمساحة 160×120
// السبب: حالة الفراغ بلا صورة تبدو كأنها عطل؛ رسم ودود يشرح أن المكان فارغ عمداً.
export const SPOTS = {
  "empty-library": (
    <g>
      <path d="M80 46c-14-10-30-13-46-10v52c16-3 32 0 46 10" />
      <path d="M80 46c14-10 30-13 46-10v52c-16-3-32 0-46 10" />
      <path d="M80 46v52" />
      <path d="M56 28h20M92 22h22M70 14h14" strokeDasharray="3 5" />
    </g>
  ),
  "empty-search": (
    <g>
      <circle cx="68" cy="56" r="32" />
      <circle cx="68" cy="56" r="17" />
      <path d="M68 24v64M36 56h64" strokeOpacity=".6" />
      <circle cx="102" cy="74" r="20" />
      <path d="M117 89l14 14" />
    </g>
  ),
  "empty-friends": (
    <g>
      <circle cx="44" cy="44" r="13" />
      <path d="M25 94c0-13 8-22 19-22s19 9 19 22" />
      <circle cx="116" cy="44" r="13" />
      <path d="M97 94c0-13 8-22 19-22s19 9 19 22" />
      <path d="M76 54a7 7 0 0 0 0 14M84 54a7 7 0 0 1 0 14" />
      <path d="M74 61h12" />
    </g>
  ),
  "empty-review": (
    <g>
      <rect x="38" y="30" width="84" height="72" rx="10" />
      <path d="M38 52h84M56 22v14M104 22v14" />
      <path d="M62 76l12 12 24-26" />
    </g>
  ),
  "empty-league": (
    <g>
      <path d="M22 102h116" />
      <rect x="64" y="46" width="32" height="56" rx="3" />
      <rect x="30" y="64" width="32" height="38" rx="3" />
      <rect x="98" y="74" width="32" height="28" rx="3" />
      <path d="M80 12l5 11 12 2-8 8 2 12-11-6-11 6 2-12-8-8 12-2z" />
    </g>
  ),
  done: (
    <g>
      <circle cx="80" cy="62" r="30" />
      <path d="M66 62l10 11 21-23" />
      <path d="M80 24V14M105 37l7-7M55 37l-7-7M118 62h10M42 62H32M105 87l7 7M55 87l-7 7" strokeDasharray="2 4" />
    </g>
  ),
};

// aria-hidden لأن الرسم زخرفي: العنوان والنص المجاوران يحملان المعنى
export default function Spot({ k, size = 120, color = C.gold, strokeWidth = 2, style = {} }) {
  return (
    <svg
      viewBox="0 0 160 120"
      width={size}
      height={(size * 3) / 4}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", maxWidth: "100%", ...style }}
    >
      {SPOTS[k] || SPOTS.done}
    </svg>
  );
}
