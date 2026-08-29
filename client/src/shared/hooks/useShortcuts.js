import { useEffect } from "react";

const isTyping = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

// اختصارات عامة. تُتجاهل أثناء الكتابة في حقل، ولا تعترض اختصارات المتصفح (Ctrl/Cmd)
export function useShortcuts(map, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const handler = map[e.key];
      if (!handler) return;
      e.preventDefault();
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map, enabled]);
}

// قائمة الاختصارات المعروضة في نافذة المساعدة (؟)
export const SHORTCUTS = [
  ["m", "الخريطة"],
  ["b", "بحث"],
  ["t", "الترتيب"],
  ["f", "الأصدقاء"],
  ["a", "صفحتي"],
  ["r", "مراجعة اليوم"],
  ["Enter", "ابدأ الوحدة المقترحة"],
  ["←/→", "التنقّل بين صفحات الدرس"],
  ["Esc", "رجوع أو إغلاق"],
  ["؟ / ?", "عرض هذه القائمة"],
];
