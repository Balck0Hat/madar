import { get, post } from "../../../shared/utils/api";

export const getDue = () => get("/reviews/due");
export const answerReview = (unitId, correct) => post(`/reviews/${unitId}/answer`, { correct });
