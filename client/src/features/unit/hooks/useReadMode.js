import { useState, useEffect } from "react";

// وضع القراءة: بطاقات (الافتراضي) أو تمرير.
// نحتفظ بنسخة محلية رغم أن القيمة تأتي من الأعلى: الحفظ على الخادم غير فوري،
// والقارئ يجب أن يرى أثر الزر في اللحظة نفسها لا بعد عودة الطلب.
const norm = (v) => (v === "scroll" ? "scroll" : "cards");

export function useReadMode(initial, onChange) {
  const [mode, setMode] = useState(() => norm(initial));
  useEffect(() => { setMode(norm(initial)); }, [initial]);

  const set = (next) => {
    const m = norm(next);
    if (m === mode) return;
    setMode(m);
    onChange?.(m);
  };

  return [mode, set];
}
