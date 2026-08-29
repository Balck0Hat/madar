import { useState, useEffect, useRef } from "react";

const reduced = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (err) { return false; }
};

// تسارع ثم تباطؤ: يجعل الرقم يُحسّ كمكسب لا كقيمة تظهر فجأة
const easeOutQuart = (t) => 1 - (1 - t) ** 4;

// عدّ تصاعدي إلى قيمة، يحترم تفضيل تقليل الحركة
export function useCountUp(target, { duration = 700, delay = 0, from = 0 } = {}) {
  const [value, setValue] = useState(reduced() ? target : from);
  const raf = useRef(null);
  useEffect(() => {
    if (reduced() || target === from) { setValue(target); return undefined; }
    let start = null;
    const timer = setTimeout(() => {
      const step = (ts) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / duration);
        setValue(Math.round(from + (target - from) * easeOutQuart(t)));
        if (t < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, delay, from]);
  return value;
}
