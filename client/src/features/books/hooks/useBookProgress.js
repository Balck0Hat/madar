import { useEffect, useState } from "react";
import { getProgress, putProgress } from "../services/books.service";

// تقدّم الكتب على الحساب، يُجلب مرة في الجلسة ويُحدَّث تفاؤلياً
let cache = null;
let inflight = null;
const EMPTY = { read: {}, last: {} };

const load = () => {
  if (cache) return Promise.resolve(cache);
  inflight ||= getProgress().then((p) => { cache = p; return p; }).catch((err) => { inflight = null; console.warn("[books] progress unavailable:", err.message); return EMPTY; });
  return inflight;
};
export const resetBookProgress = () => { cache = null; inflight = null; };

export function useBookProgress() {
  const [state, setState] = useState(() => cache || EMPTY);
  useEffect(() => { let alive = true; load().then((p) => { if (alive) setState(p); }); return () => { alive = false; }; }, []);

  const apply = (next) => { cache = next; setState(next); };
  const markRead = (bookId, n) => {
    const key = `${bookId}:${n}`;
    if (!state.read[key]) apply({ read: { ...state.read, [key]: Date.now() }, last: { ...state.last, [bookId]: n } });
    putProgress(bookId, { chapter: n, read: true }).then((p) => { cache = p; }).catch((err) => console.warn("[books] progress not saved:", err.message));
  };
  const setLast = (bookId, n) => {
    if (state.last[bookId] === n) return;
    apply({ ...state, last: { ...state.last, [bookId]: n } });
    putProgress(bookId, { chapter: n }).then((p) => { cache = p; }).catch((err) => console.warn("[books] progress not saved:", err.message));
  };
  const readCount = (bookId) => Object.keys(state.read).filter((k) => k.startsWith(`${bookId}:`)).length;
  const isRead = (bookId, n) => Boolean(state.read[`${bookId}:${n}`]);
  return { ...state, markRead, setLast, readCount, isRead };
}
