import { useEffect, useState } from "react";

const query = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (err) { return null; } };

// هل طلب المستخدم تقليل الحركة؟ يتابع التغيير الحي لإعداد النظام
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => Boolean(query()?.matches));
  useEffect(() => {
    const mq = query();
    if (!mq) return undefined;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}
