import { useEffect, useState } from "react";

// عدّ تصاعدي قصير إلى قيمة: الرقم البطل يصل لا يظهر. يحترم prefers-reduced-motion
// بأن يقفز إلى النهاية فوراً، ولا يعمل إلا عند تغيّر القيمة.
export function useCountUp(to, { from = 0, duration = 700, delay = 150 } = {}) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!Number.isFinite(to)) return undefined;
    const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still || duration <= 0) { setValue(to); return undefined; }
    let raf = 0, start = 0;
    const ease = (t) => 1 - (1 - t) ** 3;
    const tick = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      setValue(from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [to, from, duration, delay]);
  return value;
}
