// مساعدان صغيران تتشاركهما بطاقات شاشة النتيجة

// الحركة هنا مقودة من JS، فأصناف madar-* المعطّلة في CSS لا تكفي وحدها
export const prefersStill = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (err) { return false; }
};

// بيئات بلا طابع زمني في requestAnimationFrame تُرجع قيمة غير رقمية؛ نسقط إلى القيمة النهائية
export const settled = (v, end) => (Number.isFinite(v) ? v : end);
