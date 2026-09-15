import { useEffect, useRef, useState } from "react";
import { getProgress, putProgress } from "../services/figures.service";
import * as local from "../utils/figureStore";

const DELAY = 600;

// تقدّم الشخصيات على الحساب لا على الجهاز: يُفتح من هاتف آخر فيجد شارة «قُرئ»
// وموضعه. الجهاز نسخة احتياطية: تُعرض فوراً وتنفع حين لا شبكة.
let cache = null;
let inflight = null;

const fromLocal = () => ({ read: Object.fromEntries([...local.readSet()].map((id) => [id, 1])), page: {} });

const load = () => {
  if (cache) return Promise.resolve(cache);
  inflight ||= getProgress()
    .then((p) => { cache = p; return p; })
    .catch((err) => { inflight = null; console.warn("[figures] progress unavailable:", err.message); return fromLocal(); });
  return inflight;
};

export const resetFigureProgress = () => { cache = null; inflight = null; };

export function useFigureProgress(enabled = true) {
  const [state, setState] = useState(() => cache || fromLocal());
  const [loaded, setLoaded] = useState(Boolean(cache));
  const timers = useRef({});
  const pending = useRef({}); // ما لم يُرسل بعد لكل شخصية: الرقعات تُدمج لا تُستبدل

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    load().then((p) => { if (alive) { setState(p); setLoaded(true); } });
    return () => { alive = false; };
  }, [enabled]);

  const apply = (next) => { cache = next; setState(next); };
  const send = (figureId, patch) => {
    if (!enabled) return;
    pending.current[figureId] = { ...(pending.current[figureId] || {}), ...patch };
    clearTimeout(timers.current[figureId]);
    timers.current[figureId] = setTimeout(() => {
      const body = pending.current[figureId];
      delete pending.current[figureId];
      putProgress(figureId, body).then((p) => { cache = p; }).catch((err) => console.warn("[figures] progress not saved:", err.message));
    }, DELAY);
  };

  const setPage = (figureId, page) => {
    local.setPage(figureId, page);
    apply({ ...state, page: { ...state.page, [figureId]: page } });
    send(figureId, { page });
  };
  const markRead = (figureId) => {
    if (state.read[figureId]) return;
    local.markRead(figureId);
    apply({ ...state, read: { ...state.read, [figureId]: Date.now() } });
    send(figureId, { read: true });
  };

  return { read: new Set(Object.keys(state.read)), page: state.page, loaded, setPage, markRead };
}
