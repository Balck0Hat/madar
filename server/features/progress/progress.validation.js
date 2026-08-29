import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";

const unitId = z.string().refine(isValidUnitId, "معرّف وحدة غير صالح");
// selfMark: التقييم الذاتي للسؤال المفتوح — إشارة للمراجعة لا علامة في الاختبار
const answer = z.object({ qid: z.string().max(24), answer: z.any(), selfMark: z.enum(["got", "unclear"]).optional() });

// إما إجابات تُصحَّح على الخادم (وحدة مكتوبة) أو عدّ مباشر (محاكاة)
export const finishSchema = {
  params: z.object({ unitId }),
  body: z
    .object({
      answers: z.array(answer).min(1).max(30).optional(),
      correct: z.number().int().min(0).optional(),
      total: z.number().int().min(1).max(50).optional(),
      sim: z.boolean().optional().default(false),
    })
    .strict()
    .superRefine((b, ctx) => {
      if (!b.answers && (b.correct === undefined || b.total === undefined)) ctx.addIssue({ code: "custom", message: "أرسل answers أو correct/total", path: ["answers"] });
      if (b.answers && !b.sim && b.correct !== undefined) ctx.addIssue({ code: "custom", message: "لا تُرسل correct مع answers", path: ["correct"] });
      if (b.correct !== undefined && b.total !== undefined && b.correct > b.total) ctx.addIssue({ code: "custom", message: "الإجابات الصحيحة لا تتجاوز المجموع", path: ["correct"] });
    }),
};

// موضع القراءة: فهرس بطاقة داخل الوحدة (أقصى بنك بطاقات معقول 40)
export const resumeSchema = {
  params: z.object({ unitId }),
  body: z.object({ card: z.number().int().min(0).max(40) }).strict(),
};
