import { useEffect, useRef } from "react";
import { saveResume } from "../services/unit.service";

const DELAY = 600;

// يحفظ موضع القراءة بعد أن يهدأ التنقّل ٦٠٠ مللي.
// لماذا التأخير: القارئ قد يمرّ بعدة صفحات في ثوانٍ، ولا داعي لطلب شبكة لكل صفحة.
// لماذا نتجاهل أول تشغيل: عرض الوحدة نفسه ليس تقدّماً، وحفظ الصفحة ٠ يمحو الموضع المحفوظ.
export function useResume(unitId, page, onResume) {
  const timer = useRef(null);
  const pending = useRef(null);
  const first = useRef(true);
  const flush = useRef(() => {});

  flush.current = () => {
    const card = pending.current;
    pending.current = null;
    if (card == null) return;
    saveResume(unitId, card); // يحفظ ويبتلع خطأه بنفسه
    onResume?.(unitId, card); // إشعار للتطبيق ليحدّث خريطته المحلية دون إعادة جلب
  };

  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    pending.current = page;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flush.current(), DELAY);
    return () => clearTimeout(timer.current);
  }, [unitId, page]);

  // عند مغادرة الشاشة نحفظ فوراً ما لم يُرسل بعد، وإلا ضاعت آخر صفحة قرأها
  useEffect(() => () => { clearTimeout(timer.current); flush.current(); }, []);
}
