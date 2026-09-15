import { useEffect, useState } from "react";
import { get } from "../utils/api";

// فهرس الشخصيات (الأسماء والمعرّفات فقط) لكل من يحتاج أن يعرف من ذُكر في نصّ:
// بطاقات الدروس تعرض «شخصية في هذه البطاقة». يُجلب مرة في الجلسة ويُشارَك.
let cache = null;
let inflight = null;

export const loadFiguresIndex = () => {
  if (cache) return Promise.resolve(cache);
  inflight ||= get("/figures")
    .then((d) => { cache = d.figures || []; return cache; })
    .catch((err) => { inflight = null; console.warn("[figures] index unavailable:", err.message); return []; });
  return inflight;
};

export const resetFiguresIndex = () => { cache = null; inflight = null; };

export function useFiguresIndex() {
  const [list, setList] = useState(cache || []);
  useEffect(() => {
    let alive = true;
    if (!cache) loadFiguresIndex().then((l) => { if (alive) setList(l); });
    return () => { alive = false; };
  }, []);
  return list;
}
