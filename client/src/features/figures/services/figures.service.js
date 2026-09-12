import { get } from "../../../shared/utils/api";

const qs = (o) => { const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v)); const s = p.toString(); return s ? `?${s}` : ""; };

export const listFigures = (filters = {}) => get(`/figures${qs(filters)}`).then((d) => d.figures);
export const getFigure = (figureId) => get(`/figures/${encodeURIComponent(figureId)}`).then((d) => d.figure);
