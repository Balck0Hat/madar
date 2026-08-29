import { HEX_DARK as C } from "../../../shared/constants/theme";

// قطع SVG مشتركة بين الشهادة وبطاقة المشاركة.
// كل شيء هنا ألوان حرفية ومسارات محسوبة: لا متغيرات CSS ولا أنماط خارجية،
// لأن العنصرين يُسلسلان بـ XMLSerializer ويُحوّلان إلى PNG.

const RAD = Math.PI / 180;

// نجمة ثمانية (خاتم): ستة عشر رأساً بالتناوب بين نصف قطر خارجي وداخلي
export function star8(cx, cy, R) {
  const r = R * 0.76537;
  return (
    Array.from({ length: 16 }, (_, k) => {
      const rad = k % 2 ? r : R;
      const a = (k * 22.5 - 90) * RAD;
      return `${k ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
    }).join("") + "Z"
  );
}

// وردة غيّوشيه: نصف القطر r(θ) = a + b·cos(nθ + φ) — خط مغلق يشبه نقش الأختام
export function rosette(cx, cy, a, b, n, phase = 0, steps = 168) {
  return (
    Array.from({ length: steps }, (_, i) => {
      const t = (i / steps) * Math.PI * 2;
      const rad = a + b * Math.cos(n * t + phase);
      return `${i ? "L" : "M"}${(cx + rad * Math.cos(t)).toFixed(2)},${(cy + rad * Math.sin(t)).toFixed(2)}`;
    }).join("") + "Z"
  );
}

// تدرّجا الذهب: معدني بلمعة عابرة، وخط يتلاشى عند طرفيه
export function GoldDefs() {
  return (
    <>
      <linearGradient id="cg-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8A5A12" />
        <stop offset=".18" stopColor="#E0A63A" />
        <stop offset=".36" stopColor="#FFF3C8" />
        <stop offset=".52" stopColor="#F2B544" />
        <stop offset=".72" stopColor="#C0801B" />
        <stop offset=".88" stopColor="#FBE7A6" />
        <stop offset="1" stopColor="#A9741A" />
      </linearGradient>
      <linearGradient id="cg-fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={C.gold} stopOpacity="0" />
        <stop offset=".5" stopColor={C.gold} stopOpacity=".85" />
        <stop offset="1" stopColor={C.gold} stopOpacity="0" />
      </linearGradient>
    </>
  );
}

// تعشيق نجوم ثمانية مع مربعات وصل عند الزوايا — إطار زخرفي دقيق
// الإزاحة ‎-1‎ رأسياً تجعل النقش متناظراً حول منتصف الشهادة (250 وحدة)
export function GeoPattern() {
  return (
    <pattern id="cg-geo" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="translate(0,-1)">
      <g fill="none" stroke={C.gold} strokeWidth="0.55" strokeOpacity=".6">
        <path d={star8(9, 9, 9)} />
        <path d={star8(9, 9, 4.7)} strokeWidth="0.4" strokeOpacity=".3" />
        <rect x="-2.64" y="-2.64" width="5.27" height="5.27" />
        <rect x="15.36" y="-2.64" width="5.27" height="5.27" />
        <rect x="-2.64" y="15.36" width="5.27" height="5.27" />
        <rect x="15.36" y="15.36" width="5.27" height="5.27" />
      </g>
    </pattern>
  );
}

// ختم غيّوشيه: أقواس متراكزة بأعداد بتلات مختلفة حول نجمة ثمانية
export function Seal({ cx, cy, r = 20 }) {
  const k = r / 20;
  return (
    <g fill="none" stroke="url(#cg-gold)">
      <circle cx={cx} cy={cy} r={r} strokeWidth={1.1} />
      <circle cx={cx} cy={cy} r={r - 2.4} strokeWidth={0.45} strokeOpacity=".7" />
      <path d={rosette(cx, cy, r - 5, 1.9 * k, 16)} strokeWidth="0.45" strokeOpacity=".9" />
      <path d={rosette(cx, cy, r - 8.6, 1.5 * k, 12, Math.PI / 12)} strokeWidth="0.45" strokeOpacity=".75" />
      <path d={rosette(cx, cy, r - 12, 1.1 * k, 8)} strokeWidth="0.4" strokeOpacity=".6" />
      <path d={star8(cx, cy, r * 0.24)} fill="url(#cg-gold)" stroke="none" />
    </g>
  );
}

// زخرفة ركن: قوسان رفيعان ونجمة صغيرة — تُعكس بـ sx/sy لبقية الأركان
export function Corner({ x, y, sx = 1, sy = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`} fill="none" stroke="url(#cg-gold)">
      <path d="M0,15 A15,15 0 0 1 15,0" strokeWidth="0.7" strokeOpacity=".55" />
      <path d="M0,24 A24,24 0 0 1 24,0" strokeWidth="0.5" strokeOpacity=".3" />
      <path d={star8(8, 8, 4.2)} fill="url(#cg-gold)" stroke="none" />
    </g>
  );
}

// خط شعري يتلاشى عند طرفيه (يُرسم مستطيلاً ليعمل التدرّج داخل صندوقه)
export const Rule = ({ x, y, w, h = 0.8 }) => <rect x={x} y={y} width={w} height={h} fill="url(#cg-fade)" />;

// معيّن صغير يتوسّط الخطوط الفاصلة
export const Lozenge = ({ cx, cy, r = 3 }) => (
  <path d={`M${cx},${cy - r}L${cx + r},${cy}L${cx},${cy + r}L${cx - r},${cy}Z`} fill="url(#cg-gold)" />
);
