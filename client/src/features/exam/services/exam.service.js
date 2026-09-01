import { get, post } from "../../../shared/utils/api";

export const getStatus = () => get("/exam/status");
export const startExam = () => post("/exam/start");
// كل إجابة تُحفظ وحدها فور إعطائها؛ التسليم لا يحمل إجابات
export const saveAnswer = (attemptId, unitId, qid, answer) => post("/exam/answer", { attemptId, unitId, qid, answer });
export const submitExam = (attemptId) => post("/exam/submit", { attemptId });
export const verifyCertificate = (code) => get(`/exam/verify/${encodeURIComponent(code)}`);
