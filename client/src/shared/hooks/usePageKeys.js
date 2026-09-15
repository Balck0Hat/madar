import { useEffect, useRef } from "react";

const isTyping = (el) => Boolean(el) && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

// بديل لوحة المفاتيح عن مناطق النقر. الاتجاه من اليمين لليسار:
// السهم الأيسر يتقدّم كما لو قلبت الورقة، والأيمن يرجع، وEsc يخرج.
// نحتفظ بالمعالجات في ref حتى لا نعيد ربط المستمع مع كل صفحة.
export function usePageKeys(handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const h = ref.current;
      if (e.key === "ArrowLeft") h.next?.();
      else if (e.key === "ArrowRight") h.prev?.();
      else if (e.key === "Escape") h.exit?.();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
