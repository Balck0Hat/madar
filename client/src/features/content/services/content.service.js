import { get } from "../../../shared/utils/api";

export const listAuthoredIds = () => get("/content/units").then((d) => d.ids);
export const getUnit = (unitId) => get(`/content/units/${unitId}`).then((d) => d.unit);
export const getQuiz = (unitId, n = 10) => get(`/content/units/${unitId}/quiz?n=${n}`);
export const getSummaries = (ids) => get(`/content/summaries?ids=${encodeURIComponent(ids.join(","))}`).then((d) => d.summaries);
