import { useEffect, useState } from "react";

const secondsLeft = (endsAt) => (endsAt ? Math.max(0, Math.round((new Date(endsAt) - Date.now()) / 1000)) : 0);

// عدّاد تنازلي إلى نهاية المحاولة.
// الخادم هو مرجع المهلة (يرفض التسليم المتأخر)؛ هذا العرض تذكير بصري فقط،
// ولذلك نحسب من endsAt القادم من الخادم لا من مؤقّت محلي يزيغ مع توقف اللسان.
export function useExamTimer(endsAt) {
  const [left, setLeft] = useState(() => secondsLeft(endsAt));
  useEffect(() => {
    if (!endsAt) return undefined;
    setLeft(secondsLeft(endsAt));
    const id = setInterval(() => setLeft(secondsLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return left;
}

export const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
