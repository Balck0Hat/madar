import { useState, useEffect } from "react";

// خمس درجات لحجم النص؛ النص في الدرس يُقاس بوحدات نسبية فتتبع هذه القيمة
export const STEPS = [0.9, 1, 1.1, 1.25, 1.4];

const nearest = (v) => {
  const target = Number(v) || 1;
  return STEPS.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a), STEPS[0]);
};

// نطبّق القيمة على جذر الصفحة فوراً حتى يرى القارئ الأثر قبل أن يعود الحفظ من الخادم
const apply = (scale) => {
  if (typeof document !== "undefined") document.documentElement.style.setProperty("--font-scale", String(scale));
};

export function useFontScale(initial, onChange) {
  const [scale, setScale] = useState(() => nearest(initial));
  useEffect(() => { setScale(nearest(initial)); }, [initial]);

  const idx = STEPS.indexOf(scale);
  const go = (i) => {
    const next = STEPS[Math.min(STEPS.length - 1, Math.max(0, i))];
    if (next === scale) return;
    setScale(next);
    apply(next);
    onChange?.(next);
  };

  return {
    scale,
    step: idx + 1,
    total: STEPS.length,
    canDec: idx > 0,
    canInc: idx < STEPS.length - 1,
    dec: () => go(idx - 1),
    inc: () => go(idx + 1),
  };
}
