import { get, put } from "../../../shared/utils/api";

const qs = (o) => { const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v)); const s = p.toString(); return s ? `?${s}` : ""; };

export const listFigures = (filters = {}) => get(`/figures${qs(filters)}`).then((d) => d.figures);
export const getFigure = (figureId) => get(`/figures/${encodeURIComponent(figureId)}`).then((d) => d.figure);

// الصفحة العامة: بلا دخول
export const getPublicFigure = (figureId) => get(`/figures/public/${encodeURIComponent(figureId)}`).then((d) => d.figure);

// تقدّم القارئ على حسابه: { read: { id: تاريخ }, page: { id: رقم } }
export const getProgress = () => get("/figures/progress").then((d) => d.progress);
export const putProgress = (figureId, patch) => put(`/figures/progress/${encodeURIComponent(figureId)}`, patch).then((d) => d.progress);
