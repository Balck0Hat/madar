import { get, post } from "../../../shared/utils/api";

// تحدي اليوم: سؤال واحد يومياً، والإجابة تُرسل مرة واحدة فقط
export const getChallenge = () => get("/challenge");

export const answerChallenge = (answer) => post("/challenge/answer", { answer });
