import { get, post } from "../../../shared/utils/api";

export const getStatus = () => get("/exam/status");
export const startExam = () => post("/exam/start");
export const submitExam = (attemptId, answers) => post("/exam/submit", { attemptId, answers });
export const verifyCertificate = (code) => get(`/exam/verify/${encodeURIComponent(code)}`);
