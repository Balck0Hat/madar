import { useEffect, useState } from "react";

const query = (q) => { try { return window.matchMedia(q); } catch (err) { return null; } };

// استعلام وسائط حي: useMedia("(min-width: 768px)") يعيد صحيحاً على الشاشات العريضة ويتابع التغيير
export function useMedia(q) {
  const [match, setMatch] = useState(() => Boolean(query(q)?.matches));
  useEffect(() => {
    const mq = query(q);
    if (!mq) return undefined;
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [q]);
  return match;
}

export const useDesktop = () => useMedia("(min-width: 768px)");
