import { get, post, put } from "../../../shared/utils/api";

export const getState = () => get("/progress").then((d) => d.state);

// يعيد { state, result }: الخادم هو من يحسب النقاط والخيوط والأوسمة
export const finishUnit = (unitId, { answers, correct, total, sim = false }) =>
  post(`/progress/units/${unitId}/finish`, answers ? { answers } : { correct, total, sim });

// موضع القراءة الأخير في وحدة (يفشل بصمت إن لم يدعمه الخادم)
export const saveResume = (unitId, card) => put(`/progress/units/${unitId}/resume`, { card });

export const getStats = () => get("/progress/stats").then((d) => d.stats);
