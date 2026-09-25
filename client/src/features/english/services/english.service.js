import { get, post } from "../../../shared/utils/api";

export const getPlacement = () => get("/english/placement");
export const startPlacement = () => post("/english/placement", {}).then((d) => d.session);
export const answerPlacement = (id, itemId, choice) => post(`/english/placement/${id}/answer`, { itemId, choice });
export const submitWriting = (id, text) => post(`/english/placement/${id}/writing`, { text }).then((d) => d.session);
export const skipWriting = (id) => post(`/english/placement/${id}/writing`, { skip: true }).then((d) => d.session);
