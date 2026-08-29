import { useState, useEffect } from "react";

// يؤجّل تحديث القيمة حتى تهدأ الكتابة، فلا نُرهق الخادم بطلب لكل حرف.
// يعيد الدالة setter أيضاً كي يستطيع Enter دفع القيمة فوراً دون انتظار المهلة.
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    if (value === debounced) return undefined;
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]); // eslint-disable-line react-hooks/exhaustive-deps
  return [debounced, setDebounced];
}
