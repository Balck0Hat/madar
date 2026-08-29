import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";

export const answerSchema = {
  params: z.object({ unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح") }),
  // qid اختياري: به نعرف أي سؤال بعينه أخطأ فيه المتعلم لنعيده عليه لاحقاً
  body: z.object({ correct: z.boolean(), qid: z.string().trim().min(1).max(24).optional() }).strict(),
};
