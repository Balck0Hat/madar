import { get, post } from "../../../shared/utils/api";

export const getState = () => get("/progress").then((d) => d.state);

// يعيد { state, result }: الخادم هو من يحسب النقاط والخيوط والأوسمة
export const finishUnit = (unitId, { correct, total, sim = false }) =>
  post(`/progress/units/${unitId}/finish`, { correct, total, sim });
