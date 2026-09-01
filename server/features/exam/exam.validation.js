import { z } from "zod";

// كل إجابة تُحفظ وحدها فور إعطائها، والتسليم لا يحمل إجابات: الخادم
// يصحّح ما حُفظ عنده، فلا تضيع الإجابات ولا تُقبل حمولة متأخرة تتجاوز المهلة.
export const answerSchema = {
  body: z.object({
    attemptId: z.string().length(24),
    unitId: z.string().max(20),
    qid: z.string().max(24),
    answer: z.any(),
  }).strict(),
};

export const submitSchema = {
  body: z.object({ attemptId: z.string().length(24) }).strict(),
};

export const verifySchema = {
  params: z.object({ code: z.string().trim().toUpperCase().regex(/^MDR-\d{4}-[A-Z0-9]{5}$/, "رمز غير صالح") }),
};
