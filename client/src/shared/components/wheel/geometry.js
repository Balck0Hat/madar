import { parseId } from "../../utils/units";
import { hash } from "../../utils/text";

// العجلة تُرسم في فضاء 360×360 مركزه (180,180)؛ الزاوية 0 عند الأعلى
export function polar(r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [180 + r * Math.cos(a), 180 + r * Math.sin(a)];
}

// مسار قطاع حلقي بين نصفي قطر r0 و r1 وزاويتين a0 و a1
export function ring(r0, r1, a0, a1) {
  const [x0, y0] = polar(r1, a0), [x1, y1] = polar(r1, a1), [x2, y2] = polar(r0, a1), [x3, y3] = polar(r0, a0);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r1},${r1} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${r0},${r0} 0 0 0 ${x3.toFixed(2)},${y3.toFixed(2)} Z`;
}

// نصفا القطر الداخلي والخارجي لكل مدار
export const RADII = [[46, 78], [84, 116], [122, 154]];

// زاوية منتصف القطاع لمجال بترتيب di
export const sectorMid = (di) => di * 36 + 18;

// مسار قطاع مجال في مدار: pad فجوة الزاوية بين القطاعات، grow توسعة نصف القطر.
// مصدر واحد للهندسة كي يبقى هدف اللمس مطابقاً للرسم مهما تغيّرت الأرقام.
export function sectorPath(di, r, pad = 1.3, grow = 0) {
  const [r0, r1] = RADII[r];
  return ring(r0 - grow, r1 + grow, di * 36 + pad, (di + 1) * 36 - pad);
}

// توسعة هدف اللمس: ٣ وحدات تملأ الفجوة بين المدارات بلا تداخل بينها
export const HIT_GROW = 3;

// نصف قطر هدف لمس الوحدة (~26px قطراً) — النقطة المرسومة أصغر من أن تُلمس
export const HIT_UNIT = 13;

// موضع نجمة الوحدة على العجلة
export function starPos(id) {
  const p = parseId(id);
  if (p.center) return polar(22, p.i * 120 + 60);
  const [r0] = RADII[p.r];
  const a = p.di * 36 + 3.5 + (p.i + 0.5) * (29 / 8);
  return polar(r0 + 8 + ((p.i * 7) % 3) * 8, a);
}

// نجوم الخلفية خارج العجلة (ثابتة بين التصييرات)
export const SKY = Array.from({ length: 80 })
  .map((_, i) => {
    const x = -26 + hash(i) * 412, y = -26 + hash(i + 200) * 412;
    const d = Math.hypot(x - 180, y - 180);
    return { x, y, r: 0.5 + hash(i + 400) * 1.1, o: 0.18 + hash(i + 600) * 0.4, tw: hash(i + 800) > 0.6, delay: hash(i + 900) * 3, ok: d > 178 };
  })
  .filter((s) => s.ok);
